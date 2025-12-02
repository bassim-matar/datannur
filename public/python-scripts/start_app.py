#!/usr/bin/env python3
"""
Start datannur app with LLM proxy
Launches both the HTTP server for index.html and the LLM proxy in parallel
No external dependencies required - uses only Python standard library
"""

import http.server
import socketserver
import webbrowser
import subprocess
import socket
import sys
import os
import signal
import time
from pathlib import Path


DEFAULT_APP_PORT = 8080
DEFAULT_PROXY_PORT = 3001


def get_app_dir():
    """Get the app root directory (parent of python-scripts)"""
    return Path(__file__).parent.parent


def find_available_port(start_port, max_attempts=100):
    """Find an available port starting from start_port"""
    for port in range(start_port, start_port + max_attempts):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(("localhost", port))
                return port
        except OSError:
            continue
    raise RuntimeError(f"No available port found in range {start_port}-{start_port + max_attempts}")


def wait_for_port(port, timeout=5.0, interval=0.05):
    """Wait until a port is accepting connections"""
    start = time.time()
    while time.time() - start < timeout:
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(0.1)
                s.connect(("localhost", port))
                return True
        except (OSError, ConnectionRefusedError):
            time.sleep(interval)
    return False


def start_http_server(port, directory):
    """Start HTTP server to serve static files"""
    os.chdir(directory)
    handler = http.server.SimpleHTTPRequestHandler
    
    class QuietHandler(handler):
        def log_message(self, format, *args):
            pass
    
    with socketserver.TCPServer(("", port), QuietHandler) as httpd:
        httpd.serve_forever()


def main():
    app_dir = get_app_dir()
    index_path = app_dir / "index.html"
    
    if not index_path.exists():
        print(f"Error: index.html not found at {index_path}")
        print("Make sure you're running this script from the app directory")
        sys.exit(1)
    
    app_port = find_available_port(DEFAULT_APP_PORT)
    proxy_script = Path(__file__).parent / "proxy_llm.py"
    
    proxy_process = None
    
    def cleanup(signum=None, frame=None):
        if proxy_process:
            proxy_process.terminate()
            proxy_process.wait()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)
    
    print(f"Starting datannur...")
    
    if proxy_script.exists():
        proxy_process = subprocess.Popen(
            [sys.executable, str(proxy_script)],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print(f"  LLM proxy:  http://localhost:{DEFAULT_PROXY_PORT}", end="", flush=True)
        if wait_for_port(DEFAULT_PROXY_PORT):
            print(" ✓")
        else:
            print(" (timeout)")
    else:
        print(f"  LLM proxy:  not available (proxy_llm.py not found)")
    
    print(f"  App server: http://localhost:{app_port}")
    print(f"\nPress Ctrl+C to stop\n")
    
    webbrowser.open(f"http://localhost:{app_port}")
    
    try:
        start_http_server(app_port, app_dir)
    except KeyboardInterrupt:
        pass
    finally:
        cleanup()


if __name__ == "__main__":
    main()
