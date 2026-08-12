"""Upload docs/demo.mp4 to GitHub via Contents API (persistent raw URL).

Usage (PowerShell, token only in your terminal — do not paste in chat):
  $env:GITHUB_TOKEN = "ghp_..."
  python docs/demo-audio/_push_demo.py
"""
from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

REPO = "linyf-B/keeperhub-intent-agent"
BRANCH = "main"
PATH = "docs/demo.mp4"
LOCAL = Path(__file__).resolve().parents[1] / "demo.mp4"


def api(method: str, url: str, token: str, body: dict | None = None) -> dict:
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "keeperhub-demo-upload")
    if body is not None:
        req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def main() -> None:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    if not token:
        raise SystemExit("Set GITHUB_TOKEN in your terminal first.")

    if not LOCAL.exists():
        raise SystemExit(f"Missing file: {LOCAL}")

    content_b64 = base64.b64encode(LOCAL.read_bytes()).decode()
    url = f"https://api.github.com/repos/{REPO}/contents/{PATH}"

    body = {
        "message": "Add demo video for DoraHacks submission.",
        "content": content_b64,
        "branch": BRANCH,
    }

    try:
        existing = api("GET", url, token)
        body["sha"] = existing["sha"]
        print("Updating existing demo.mp4 ...")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        print("Creating demo.mp4 ...")

    result = api("PUT", url, token, body)
    raw = f"https://github.com/{REPO}/raw/{BRANCH}/{PATH}"
    cdn = f"https://raw.githubusercontent.com/{REPO}/{BRANCH}/{PATH}"
    print("OK")
    print("raw:", raw)
    print("cdn:", cdn)
    print("commit:", result.get("commit", {}).get("html_url", ""))


if __name__ == "__main__":
    main()
