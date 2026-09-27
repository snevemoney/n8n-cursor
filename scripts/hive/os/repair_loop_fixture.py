"""Harmless acceptance fixture. badge returns ok when n >= 0, else bad."""
from __future__ import annotations


def badge(n: int) -> str:
    if n >= 0:
        return "ok"
    return "bad"
