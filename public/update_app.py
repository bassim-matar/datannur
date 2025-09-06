import json
import sys
import requests
import zipfile
import shutil
from pathlib import Path

GITHUB_REPO = "bassim-matar/datannur"
PROXY_URL = "127.0.0.1:9000"
REPO_PATH = Path(__file__).parent
TEMP_DIR = REPO_PATH / "_temp_update_app"
CONFIG_FILE = REPO_PATH / "data" / "update_app.json"


def get_config():
    if not CONFIG_FILE.exists():
        print(f"Error: Config file '{CONFIG_FILE}' does not exist.")
        sys.exit(1)

    try:
        config = json.loads(CONFIG_FILE.read_text())
    except json.JSONDecodeError:
        print(f"Error: '{CONFIG_FILE}' is not valid JSON.")
        sys.exit(1)

    required_keys = ["target_version", "include"]
    for key in required_keys:
        if key not in config:
            print(f"Error: Missing '{key}' in config file.")
            sys.exit(1)

    return config


def get_asset_url(target_version):
    """Get download URL for the app asset from GitHub releases."""
    if target_version == "pre-release":
        url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/tags/pre-release"
        asset_name = "datannur-app-pre-release.zip"
    elif target_version == "latest":
        url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
        asset_name = "datannur-app-latest.zip"
    else:
        url = (
            f"https://api.github.com/repos/{GITHUB_REPO}/releases/tags/v{target_version}"
        )
        asset_name = "datannur-app-latest.zip"

    try:
        response = requests.get(url)
    except requests.exceptions.RequestException:
        response = requests.get(url, proxies={"http": PROXY_URL, "https": PROXY_URL})

    if response.status_code != 200:
        print(f"Failed to get release. Status code: {response.status_code}")
        sys.exit(1)

    release_data = response.json()

    for asset in release_data.get("assets", []):
        if asset["name"] == asset_name:
            return asset["browser_download_url"]

    print(f"Asset {asset_name} not found in release")
    sys.exit(1)


def download_and_extract(zip_url):
    """Download and extract app package."""
    filename = zip_url.split("/")[-1]
    zip_file_path = TEMP_DIR / filename

    try:
        response = requests.get(zip_url)
    except requests.exceptions.RequestException:
        print(f"Retry with proxy {PROXY_URL}")
        response = requests.get(
            zip_url, proxies={"http": PROXY_URL, "https": PROXY_URL}
        )

    if response.status_code != 200:
        print(f"Failed to download. Status code: {response.status_code}")
        return False

    zip_file_path.write_bytes(response.content)
    print(f"Downloaded {filename}")

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(TEMP_DIR)
    print(f"Extracted to {TEMP_DIR}")

    return True


def copy_files(source_dir, files_to_copy):
    """Copy specified files from source to repo directory."""
    print(f"Copying files from {source_dir}")
    for item in files_to_copy:
        source_item = source_dir / item
        destination_item = REPO_PATH / item

        if source_item.is_file():
            destination_item.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_item, destination_item)
            print(f"Copied file {item}")
        elif source_item.is_dir():
            if destination_item.exists():
                shutil.rmtree(destination_item)
            shutil.copytree(source_item, destination_item)
            print(f"Copied directory {item}")
        else:
            print(f"Item {item} not found in source")


def add_jsonjsdb_config():
    """Add JSON JS DB config to index.html."""
    jdb_config = (REPO_PATH / "data" / "jsonjsdb_config.html").read_text()
    original_index = (REPO_PATH / "index.html").read_text()
    index_without_config = original_index.split('<div id="jsonjsdb_config"')[0]
    index_with_new_config = index_without_config + jdb_config
    (REPO_PATH / "index.html").write_text(index_with_new_config)


def clear_temp_dir():
    """Remove temporary directory if it exists."""
    if TEMP_DIR.exists():
        try:
            shutil.rmtree(TEMP_DIR)
            print(f"Deleted {TEMP_DIR}")
        except OSError:
            print(f"Failed to delete {TEMP_DIR}")


def main():
    config = get_config()
    print("Start update to version:", config["target_version"])

    asset_url = get_asset_url(config["target_version"])
    clear_temp_dir()
    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    if download_and_extract(asset_url):
        copy_files(TEMP_DIR, config["include"])
        add_jsonjsdb_config()

    clear_temp_dir()


if __name__ == "__main__":
    main()
