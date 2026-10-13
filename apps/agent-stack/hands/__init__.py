"""The live stack loads hands by file path (launchd has no PYTHONPATH); this file is only for `from hands import x`.

hands/memory.py was renamed to hands/remember.py so it no longer shadows the memory/ package. `hands.memory`
stays an alias so older callers (the locked memory checks) keep working without a shadowing file.
"""


def __getattr__(name: str):
    if name == "memory":
        from . import remember

        return remember
    raise AttributeError(name)
