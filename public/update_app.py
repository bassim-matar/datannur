import json
import os
import sys
import requests
import zipfile
import shutil
from pathlib import Path

github_owner = "bassim-matar"
github_repo = "datannur-app"
proxy_url = "127.0.0.1:9000"  # to bypass firewall if needed, in case of ssl error: pip install pip_system_certs
repo_path = Path(__file__).parent
temp_dir = repo_path / "_temp_update_app"
config_file = repo_path / "update_app.json"


def get_config(config_file):
    if not os.path.exists(config_file):
        print(f"Error: The file '{config_file}' does not exist.")
        sys.exit(1)
    try:
        with open(config_file, "r") as file:
            config = json.load(file)
    except json.JSONDecodeError:
        print(f"Error: The file '{config_file}' is not a valid JSON file.")
        sys.exit(1)

    if not "target_version" in config:
        print(f"Error: The file '{config_file}' does not contain 'target_version' key.")
        sys.exit(1)
    if not "include" in config:
        print(f"Error: The file '{config_file}' does not contain 'include' key.")
        sys.exit(1)
    return config


def get_zip_url(target_version, github_owner, github_repo):
    if target_version == "pre-release":
        zip_url = f"https://github.com/{github_owner}/{github_repo}/archive/refs/heads/main.zip"

    elif target_version == "latest":
        url = (
            f"https://api.github.com/repos/{github_owner}/{github_repo}/releases/latest"
        )
        try:
            response = requests.get(url)
        except requests.exceptions.RequestException as e:
            response = requests.get(
                url, proxies={"http": proxy_url, "https": proxy_url}
            )

        if response.status_code != 200:
            print(f"Failed to get latest release. Status code: {response.status_code}")
            sys.exit(1)
        latest_release = response.json()
        zip_url = f"https://github.com/{github_owner}/{github_repo}/archive/refs/tags/{latest_release['tag_name']}.zip"

    else:
        zip_url = f"https://github.com/{github_owner}/{github_repo}/archive/refs/tags/{target_version}.zip"
    return zip_url


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


def add_jsonjsdb_config(repo_path):
    jdb_config = get_file_content(repo_path / "data" / "jsonjsdb_config.html")
    original_index = get_file_content(repo_path / "index.html")
    index_without_config = original_index.split('<div id="jsonjsdb_config"')[0]
    index_with_new_config = index_without_config + jdb_config
    with open(repo_path / "index.html", "w") as index:
        index.write(index_with_new_config)


def clear_temp_dir(temp_dir):
    if temp_dir.exists():
        try:
            shutil.rmtree(temp_dir)
            print(f"Deleted {temp_dir}")
        except OSError as e:
            print(f"fail to delete {temp_dir}")


def main():
    config = get_config(config_file)
    print("start update to version :", config["target_version"])
    zip_url = get_zip_url(config["target_version"], github_owner, github_repo)
    clear_temp_dir(temp_dir)
    temp_dir.mkdir(parents=True, exist_ok=True)
    downloaded = download_app(zip_url, temp_dir)
    if downloaded:
        repo_name = get_repo_name(temp_dir)
        copy_files(repo_path, temp_dir / repo_name, config["include"])
        add_jsonjsdb_config(repo_path)
    clear_temp_dir(temp_dir)


if __name__ == "__main__":
    main()
