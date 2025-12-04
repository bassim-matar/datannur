#!/usr/bin/env python3
"""
Start datannur app with LLM proxy
Launches both the HTTP server for index.html and the LLM proxy in parallel
No external dependencies required - uses only Python standard library
"""

import subprocess
import sys
import webbrowser
from pathlib import Path

APP_PORT = 8080
APP_DIR = Path(__file__).parent.parent


def main():
    proxy_script = Path(__file__).parent / "proxy_llm.py"
    processes = []

    if proxy_script.exists():
        processes.append(subprocess.Popen([sys.executable, str(proxy_script)]))

    processes.append(
        subprocess.Popen(
            [sys.executable, "-m", "http.server", str(APP_PORT)], cwd=str(APP_DIR)
        )
    )

    print(f"\n  App: http://localhost:{APP_PORT}")
    print(f"  Press Ctrl+C to stop\n")

    webbrowser.open(f"http://localhost:{APP_PORT}")

    try:
        for p in processes:
            p.wait()
    except KeyboardInterrupt:
        for p in processes:
            p.terminate()


if __name__ == "__main__":
    main()
