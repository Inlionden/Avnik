"""Vercel serverless entrypoint.

Vercel's Python runtime auto-detects an ASGI app named `app` in any file under
/api and serves it as a serverless function. This module just re-exports the
real FastAPI app from main.py so the whole backend (/chat, /pulse, /health)
runs as one function, routed by vercel.json.
"""
import os
import sys

# backend/ (the parent of this api/ dir) holds main.py and the avnik/ package —
# put it on sys.path so both import cleanly regardless of Vercel's cwd.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app  # noqa: E402
