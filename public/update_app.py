import requests
import zipfile
import shutil
from pathlib import Path

zip_url = "https://github.com/bassim-matar/datannuaire-app/archive/refs/heads/main.zip"
proxy_url = "127.0.0.1:9000"  # to bypass firewall if needed, in case of ssl error: pip install pip_system_certs
to_copy = [
    "assets",
    ".htaccess",
    "index.html",
    "LICENSE.md",
    "manifest.json",
    "static_make/config.json",
    "static_make/js/make.js",
    "static_make/js/package.json",
    "static_make/py/make.py",
    "static_make/py/make.sh",
    "static_make/py/setup.sh",
]

path = Path(__file__).parent
temp_dir = path / "_temp_update_app"

def download_app(zip_url, temp_dir):
    filename = zip_url.split("/")[-1]
    zip_file_path = temp_dir / filename
    try:
        response = requests.get(zip_url)
    except requests.exceptions.RequestException as e:
        print(f"retry with proxy {proxy_url}")
        response = requests.get(
            zip_url, proxies={"http": proxy_url, "https": proxy_url}
        )

    if response.status_code != 200:
        print(f"Failed to download {zip_url}. Status code: {response.status_code}")
        return False

    with open(zip_file_path, "wb") as zip_file:
        zip_file.write(response.content)
    print(f"Downloaded {filename} to {zip_file_path}")

    with zipfile.ZipFile(zip_file_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)
    print(f"Extracted {filename} to {temp_dir}")

    return True

def get_repo_name(folder_path):
    for child in folder_path.iterdir():
        if child.is_dir():
            return child.name
    return None

def copy_files(app_path, temp_dir, to_copy):
    print("Copying files from", temp_dir)
    for item in to_copy:
        source_item = temp_dir / item
        destination_item = app_path / item
        if source_item.is_file():
            destination_item.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_item, destination_item)
            print(f"Copied file {item} to {destination_item}")
        elif source_item.is_dir():
            if destination_item.is_dir():
                shutil.rmtree(destination_item)
            shutil.copytree(source_item, destination_item)
            print(f"Copied directory {item} to {destination_item}")
        else:
            print(f"Item {item} not found in source directory")


def get_file_content(path):
    with open(path, "r") as file:
        return file.read()


def add_config():
    path = Path(__file__).parent
    config = get_file_content(path / "data" / "jsonjsdb_config.html")
    original_index = get_file_content(path / "index.html")
    index_without_config = original_index.split('<div id="jsonjsdb_config"')[0]
    index_with_new_config = index_without_config + config
    with open(path / "index.html", "w") as index:
        index.write(index_with_new_config)


def clear_temp_dir(temp_dir):
    if temp_dir.exists():
        try:
            shutil.rmtree(temp_dir)
            print(f"Deleted {temp_dir}")
        except OSError as e:
            print(f"fail to delete {temp_dir}")


def main():
    clear_temp_dir(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    downloaded = download_app(zip_url, temp_dir)
    if downloaded:
        repo_name = get_repo_name(temp_dir)
        copy_files(path, temp_dir / repo_name, to_copy)
        add_config()
    clear_temp_dir(temp_dir)


if __name__ == "__main__":
    main()
