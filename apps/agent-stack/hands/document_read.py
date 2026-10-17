"""Document text through the already configured MarkItDown connector."""
import importlib.util
import json
import sys
from pathlib import Path

FORMATS = {'.pdf', '.epub', '.docx', '.pptx', '.xlsx', '.odt'}

def read(path, limit, runner=None, *, offset=0):
    if Path(path).suffix.lower() == '.epub':
        name = 'agent_stack_native_epub_read'
        if name not in sys.modules:
            spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name('epub_read.py'))
            module = importlib.util.module_from_spec(spec); sys.modules[name] = module; spec.loader.exec_module(module)
        got = sys.modules[name].read_epub(path, offset=offset, limit=limit)
        return {**got, 'truncated': not got.get('complete', False)}
    if runner is None:
        name = 'agent_stack_document_agent_tools'
        if name not in sys.modules:
            spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name('agent_tools.py'))
            module = importlib.util.module_from_spec(spec); sys.modules[name] = module; spec.loader.exec_module(module)
        runner = sys.modules[name].op_mcp
    got = runner('markitdown', 'convert_to_markdown', {'uri': Path(path).as_uri()})
    if not got.get('ok'):
        return {'ok': False, 'text': '', 'truncated': False,
                'error': 'The configured document reader failed. ' + str(got.get('spoken') or 'Reconnect MarkItDown before retrying.')}
    text = str(got.get('output') or '')
    try:
        decoded = json.loads(text)
        if isinstance(decoded, str):
            text = decoded
        elif isinstance(decoded, dict) and isinstance(decoded.get('result'), str):
            text = decoded['result']
    except ValueError:
        pass
    if not text.strip():
        return {'ok': False, 'text': '', 'truncated': False,
                'error': 'No readable text was extracted. This document may need OCR; I have not read its contents.'}
    # The existing MCP transport caps at 3000 characters; never claim a full read at that boundary.
    truncated = len(str(got.get('output') or '')) >= 3000 or len(text.encode('utf-8')) > limit
    return {'ok': True, 'text': text.encode('utf-8')[:limit].decode('utf-8', 'replace'),
            'truncated': truncated, 'error': ''}
