import os
import time
import json
import http.server
import threading
import socket
import socketserver
from pathlib import Path
from shutil import rmtree
from urllib.parse import urlparse, urljoin
from playwright.async_api import async_playwright
import asyncio
import xml.etree.ElementTree as ET

index_file = "./index.html"
entry_point = "./index_static_make.html"
config_file = "../config.json"
config_user_file = "../../data/static_make_config.json"


class ServerContainer:
    def __init__(self):
        self.server = None


class StoppableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

    def __init__(self, *args, **kwargs):
        super(StoppableTCPServer, self).__init__(*args, **kwargs)
        self.stop_serve_forever = False

    def serve_forever(self):
        while not self.stop_serve_forever:
            self.handle_request()

    def stop(self):
        self.stop_serve_forever = True
        with socket.socket(self.address_family, self.socket_type) as s:
            try:
                s.connect(self.server_address)
                s.shutdown(socket.SHUT_RDWR)
            except Exception:
                pass


class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="", **kwargs)

    def log_message(self, format, *args):
        pass

    def do_GET(self):
        url_path = urlparse(self.path).path
        if os.path.exists(url_path.strip("/")) and not os.path.isdir(
            url_path.strip("/")
        ):
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        else:
            self.path = entry_point
            return http.server.SimpleHTTPRequestHandler.do_GET(self)


def generate_sitemap(routes, domain, change_frequency="monthly"):

    def calculate_priority(url):
        if url == "":
            return 1.0
        depth = len(url.strip("/").split("/"))
        return max(0.3, 1.0 - depth * 0.2)

    sitemap = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    for route in routes:
        url_element = ET.SubElement(sitemap, "url")
        loc = ET.SubElement(url_element, "loc")
        loc.text = urljoin(domain, route)

        priority = ET.SubElement(url_element, "priority")
        priority.text = str(calculate_priority(route))

        changefreq = ET.SubElement(url_element, "changefreq")
        changefreq.text = change_frequency

    # Generate XML tree and write to file
    tree = ET.ElementTree(sitemap)
    tree.write("sitemap.xml", xml_declaration=True, encoding="utf-8", method="xml")
    print("Sitemap has been successfully created!")


def create_index_file(index_file, entry_point):
    try:
        with open(index_file, "r", encoding="utf8") as file:
            index = file.read()
        index = index.replace('<base href=""', '<base href="/"')
        index = index.replace("<head>", '<head><meta app_mode="static" />')
        if config["index_seo"]:
            index = index.replace(
                '<meta name="robots" content="noindex"', '<meta name="robots" '
            )

        with open(entry_point, "w", encoding="utf8") as file:
            file.write(index)
    except Exception as error:
        print(f"Failed to read or parse {index_file}", error)
        return None


def delete_index_file(entry_point):
    try:
        os.remove(entry_point)
    except Exception as error:
        print(f"Failed to delete {entry_point}", error)


def array_to_object(array_data):
    keys = array_data[0]
    return [{keys[i]: item for i, item in enumerate(row)} for row in array_data[1:]]


def add_path_db_key(path):
    folders = [x for x in path.iterdir() if x.is_dir()]
    if not folders:
        return path
    return folders[0]


def get_entities_routes(db_meta_path):
    routes = []
    for entity in config["entities"]:
        file_path = db_meta_path / f"{entity}.json.js"
        with open(file_path, "r", encoding="utf-8") as file:
            data = file.read()
            json_part = data.split("=", 1)[1].strip()
            try:
                json_data = json.loads(json_part)
            except json.decoder.JSONDecodeError as e:
                print("Error decoding JSON at position:", e.pos)
                print(
                    "JSON data near error:", json_part[max(0, e.pos - 50) : e.pos + 50]
                )
                raise

            if len(json_data) > 0 and isinstance(json_data[0], list):
                json_data = array_to_object(json_data)
            for row in json_data:
                routes.append(f"{entity}/{row['id']}")
    return routes


def save_content(content, route):
    doctype = "<!DOCTYPE html>"
    if not content.startswith(doctype):
        content = f"{doctype}\n{content}"
    filename = f'{config["out_dir"]}/{route or "index"}.html'
    with open(filename, "w", encoding="utf-8") as file:
        file.write(content)
    print(f"create page: {route or 'index'}")


async def scrape_page(page, route, is_first_page_loaded):
    url = f"http://localhost:{config['port']}/{route}"
    if is_first_page_loaded:
        await page.evaluate(
            f"window.history.pushState({{path:'{route}'}}, '', '{route}');"
        )
        await page.evaluate("window.dispatchEvent(new PopStateEvent('popstate'));")
        await page.wait_for_selector(
            "#page_loaded_route_" + route.replace("/", "___"),
            state="attached",
            timeout=10000,
        )
    else:
        await page.goto(url)
        await page.wait_for_selector(
            "#" + config["id_loaded"], state="attached", timeout=10000
        )
    return await page.content()


async def process_tab(context, routes):
    page = await context.new_page()
    try:
        is_first_page_loaded = False
        for route in routes:
            content = await scrape_page(page, route, is_first_page_loaded)
            is_first_page_loaded = True
            if content:
                save_content(content, route)
    except Exception as e:
        print("Error:", e)
    finally:
        await page.close()


async def scrape(routes):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        concurrency = config["concurrency"]
        route_batches = [routes[i::concurrency] for i in range(concurrency)]
        try:
            tasks = [process_tab(context, batch) for batch in route_batches]
            await asyncio.gather(*tasks)
        except Exception as e:
            print("Error:", e)
        finally:
            await context.close()
            await browser.close()


def run_server(container, server_class=StoppableTCPServer, handler_class=CustomHandler):
    server_address = ("", config["port"])
    container.server = server_class(server_address, handler_class)
    print(f"Server running at http://localhost:{config['port']}/")
    container.server.serve_forever()


async def main():
    routes = config["routes"]
    os.chdir(config["app_path"])
    rmtree(config["out_dir"], ignore_errors=True)
    os.makedirs(config["out_dir"], exist_ok=True)
    for entity in config["entities"]:
        os.makedirs(config["out_dir"] + "/" + entity, exist_ok=True)
    db_meta_path = add_path_db_key(Path(config["db_meta_path"]))
    routes.extend(get_entities_routes(db_meta_path))
    create_index_file(index_file, entry_point)
    server_container = ServerContainer()
    server_thread = threading.Thread(target=lambda: run_server(server_container))
    server_thread.daemon = True
    server_thread.start()
    try:
        time.sleep(config["wait_server"])
        await scrape(routes)
    finally:
        if server_container.server:
            server_container.server.stop()
        server_thread.join()
        delete_index_file(entry_point)
        time_taken = time.time() - start_time
        print(f"Static site created {len(routes)} pages in {time_taken:.2f} seconds")

        if config["index_seo"]:
            generate_sitemap(routes, config["domain"])


start_time = time.time()
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with open(config_file, "r", encoding="utf-8") as f:
    config = json.load(f)

if os.path.exists(config_user_file):
    with open(config_user_file, "r", encoding="utf-8") as file:
        config_user = json.load(file)
        for key in config_user:
            config[key] = config_user[key]

asyncio.run(main())
