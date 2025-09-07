import hashlib
import json
import shutil
import sys
import tempfile
import urllib.error
import urllib.request
import zipfile
from pathlib import Path
from typing import TypedDict
from urllib.response import addinfourl

REPO_PATH = Path(__file__).parent
GITHUB_REPO_API = "https://api.github.com/repos/bassim-matar/datannur/releases"
CONFIG_FILE = REPO_PATH / "data" / "update_app.json"
ASSET_PRE_RELEASE = "datannur-app-pre-release.zip"
ASSET_LATEST = "datannur-app-latest.zip"
MAX_DOWNLOAD_SIZE = 100 * 1024 * 1024  # 100MB
REQUEST_TIMEOUT = 30  # seconds


class Config(TypedDict):
    target_version: str
    include: list[str]
    proxy_url: str | None


class AssetInfo(TypedDict):
    url: str
    sha256: str


def get_config() -> Config:
    if not CONFIG_FILE.exists():
        print(f"❌ Error: Config file '{CONFIG_FILE}' does not exist.")
        sys.exit(1)
    try:
        config = json.loads(CONFIG_FILE.read_text())
    except json.JSONDecodeError:
        print(f"❌ Error: '{CONFIG_FILE}' is not valid JSON.")
        sys.exit(1)

    required_keys = ["target_version", "include"]
    for key in required_keys:
        if key not in config:
            print(f"❌ Error: Missing '{key}' in config file.")
            sys.exit(1)

    if not isinstance(config["target_version"], str):
        print("❌ Error: 'target_version' must be a string.")
        sys.exit(1)

    if not isinstance(config["include"], list):
        print("❌ Error: 'include' must be a list.")
        sys.exit(1)

    if not all(isinstance(item, str) for item in config["include"]):
        print("❌ Error: All items in 'include' must be strings.")
        sys.exit(1)

    proxy_url = config.get("proxy_url")
    if proxy_url is not None and not isinstance(proxy_url, str):
        print("❌ Error: 'proxy_url' must be a string or null.")
        sys.exit(1)

    return config


def make_request(url: str, proxy_url: str | None = None) -> bytes:
    """Make HTTP request with optional proxy and size limit."""

    def read_with_limit(response: addinfourl) -> bytes:
        content_length = response.headers.get("Content-Length")
        if content_length and int(content_length) > MAX_DOWNLOAD_SIZE:
            msg = f"❌ File too large: {content_length} bytes (max: {MAX_DOWNLOAD_SIZE})"
            raise ValueError(msg)

        data = response.read(MAX_DOWNLOAD_SIZE + 1)
        if len(data) > MAX_DOWNLOAD_SIZE:
            msg = f"❌ Downloaded file exceeds size limit: {len(data)} bytes (max: {MAX_DOWNLOAD_SIZE})"
            raise ValueError(msg)
        return data

    if proxy_url:
        print(f"Using proxy {proxy_url}")
        proxy_values = {"http": proxy_url, "https": proxy_url}
        proxy_handler = urllib.request.ProxyHandler(proxy_values)
        opener = urllib.request.build_opener(proxy_handler)
        with opener.open(url, timeout=REQUEST_TIMEOUT) as response:
            return read_with_limit(response)
    else:
        with urllib.request.urlopen(url, timeout=REQUEST_TIMEOUT) as response:
            return read_with_limit(response)


def verify_file_integrity(file_path: Path, expected_sha256: str) -> bool:
    """Verify downloaded file integrity using SHA256."""
    with open(file_path, "rb") as f:
        file_hash = hashlib.sha256(f.read()).hexdigest()

    if file_hash != expected_sha256:
        print(f"❌ Security Warning: File integrity check failed!")
        print(f"Expected: {expected_sha256}")
        print(f"Got:      {file_hash}")
        return False

    print("✅ File integrity verified")
    return True


def get_asset_url(target_version: str, proxy_url: str | None = None) -> AssetInfo:
    """Get download URL and SHA256 for the app asset from GitHub releases."""
    if target_version == "pre-release":
        url = f"{GITHUB_REPO_API}/tags/pre-release"
        asset_name = ASSET_PRE_RELEASE
    elif target_version == "latest":
        url = f"{GITHUB_REPO_API}/latest"
        asset_name = ASSET_LATEST
    else:
        url = f"{GITHUB_REPO_API}/tags/v{target_version}"
        asset_name = ASSET_LATEST
    try:
        response_data = make_request(url, proxy_url)
        release_data = json.loads(response_data.decode())
    except urllib.error.URLError as e:
        print(f"❌ Failed to fetch release data: {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"❌ API response size error: {e}")
        sys.exit(1)

    for asset in release_data.get("assets", []):
        if asset["name"] == asset_name:
            digest = asset.get("digest", "")
            sha256_hash = digest[7:] if digest.startswith("sha256:") else ""
            return {"url": asset["browser_download_url"], "sha256": sha256_hash}

    print(f"Asset {asset_name} not found in release")
    sys.exit(1)


def download_and_extract(
    asset_info: AssetInfo, temp_dir: Path, proxy_url: str | None = None
) -> bool:
    """Download and extract app package with integrity verification."""
    zip_url = asset_info["url"]
    expected_sha256 = asset_info["sha256"]
    filename = zip_url.split("/")[-1]
    zip_file_path = temp_dir / filename

    try:
        file_data = make_request(zip_url, proxy_url)
    except urllib.error.URLError as e:
        print(f"❌ Failed to download {filename}: {e}")
        return False
    except ValueError as e:
        print(f"❌ Download size error: {e}")
        return False

    zip_file_path.write_bytes(file_data)
    print(f"✅ Downloaded {filename}")

    if not expected_sha256:
        print("❌ No SHA256 available for verification. Aborting for security.")
        return False

    if not verify_file_integrity(zip_file_path, expected_sha256):
        print("❌ Download integrity check failed. Aborting update.")
        return False

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)
    print(f"✅ Extracted to {temp_dir}")

    return True


def copy_files(source_dir: Path, files_to_copy: list[str]) -> None:
    """Copy specified files from source to repo directory."""
    for item in files_to_copy:
        source_item = source_dir / item
        destination_item = REPO_PATH / item
        try:
            destination_item.resolve().relative_to(REPO_PATH.resolve())
        except ValueError:
            print(f"❌ Security error: {item} would write outside repository scope")
            continue
        try:
            if source_item.is_file():
                destination_item.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source_item, destination_item)
                print(f"✅ Copied file {item}")
            elif source_item.is_dir():
                if destination_item.exists():
                    if destination_item.is_dir():
                        shutil.rmtree(destination_item)
                    else:
                        destination_item.unlink()
                shutil.copytree(source_item, destination_item)
                print(f"✅ Copied directory {item}")
            else:
                print(f"⚠️  Item {item} not found in source")
        except OSError as e:
            print(f"❌ Failed to copy {item}: {e}")


def add_jsonjsdb_config() -> None:
    """Add jsonjsdb config to index.html."""
    config_file = REPO_PATH / "data/jsonjsdb_config.html"
    index_file = REPO_PATH / "index.html"
    files_to_check = [(config_file, "jsonjsdb_config"), (index_file, "index")]
    for file_path, name in files_to_check:
        if not file_path.exists():
            print(f"⚠️ Warning: {name} file '{file_path}' not found, no config")
            return
    try:
        jdb_config = config_file.read_text(encoding="utf-8")
        original_index = index_file.read_text(encoding="utf-8")
        index_without_config = original_index.split('<div id="jsonjsdb_config"')[0]
        index_with_new_config = index_without_config + jdb_config
        index_file.write_text(index_with_new_config, encoding="utf-8")
        print("✅ JSON JS DB config added to index.html")
    except OSError as e:
        print(f"❌ Error updating index.html: {e}")


def main() -> None:
    config = get_config()
    print("Start update to version:", config["target_version"])
    proxy_url = config.get("proxy_url")
    asset_info = get_asset_url(config["target_version"], proxy_url)
    with tempfile.TemporaryDirectory(prefix="datannur_update_") as temp_dir:
        temp_path = Path(temp_dir)
        if download_and_extract(asset_info, temp_path, proxy_url):
            copy_files(temp_path, config["include"])
            add_jsonjsdb_config()
            print("✅ Update completed successfully")
        else:
            print("❌ Update failed")


if __name__ == "__main__":
    main()
