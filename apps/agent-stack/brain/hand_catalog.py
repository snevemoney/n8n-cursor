"""Names shared by dispatch, capability discovery and model tool advertisement.
Presence describes implementation, never authority or verified readiness.
"""
from pathlib import Path

HANDS = ('operator', 'capability', 'apps', 'repo', 'vault_read', 'rules', 'workbench', 'drafts', 'pickup', 'multistep', 'handback', 'pointer', 'pointer_click', 'pointer_demo', 'cost_card', 'results_recall', 'prebrief', 'workspace_read', 'memory', 'skills', 'mcp_inventory', 'mcp_call', 'agent_tools', 'plan', 'screen_see', 'voice_engine', 'loop', 'desk_dispatch', 'code_run', 'web_search', 'safari_see', 'browser_mission', 'cursor_ask', 'craft', 'status', 'refuse_hard_step')
NATIVE_SOURCES = {'pointer':'pointer.py','apps':'apps.py','workspace_read':'workspace_read.py',
                  'agent_tools':'agent_tools.py','screen_see':'screen_see.py','repo':'repo.py',
                  'browser_mission':'browser_runtime.py','code_run':'code_run.py','operator':'operator.py'}

# Explicit implementation metadata, not plugin discovery or execution authority.
# Native mission executor membership remains NATIVE_SOURCES, unchanged.
OPTIONAL_SOURCES = {**NATIVE_SOURCES,
    'pointer_click':'pointer.py','pointer_demo':'pointer.py',
    'skills':'skills.py','mcp_inventory':'mcp_inventory.py','mcp_call':'mcp_call.py',
    'web_search':'web_search.py','craft':'craft.py','plan':'plan.py'}

def optional_source_missing(name, stack):
    source = OPTIONAL_SOURCES.get(name)
    return bool(source and not (Path(stack)/'hands'/source).is_file())


def available_executors(stack):
    return tuple(name for name, source in NATIVE_SOURCES.items()
                 if name in HANDS and (Path(stack)/'hands'/source).is_file())

def provider_tools(schemas, stack):
    return [row for row in schemas
            if row.get('function', {}).get('name') in HANDS
            and not optional_source_missing(row['function']['name'], stack)]
