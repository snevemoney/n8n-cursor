"""Harmless acceptance fixture. Correct badge is ok when n >= 0, else bad.

This implementation is wrong on purpose: it always returns bad.
"""
from __future__ import annotations


def badge(n: int) -> str:
    return "bad"
