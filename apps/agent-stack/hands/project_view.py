"""Read-only presentation of an existing local project review queue."""
def snapshot(hand, root, utterance):
    match = hand.COMMAND.match(utterance.strip())
    if not match or match.group(2).lower() not in {'draft', 'review', 'review queue', 'board', 'stage'}:
        return None
    project = match.group(1).lower()
    try:
        items = hand.queue(root, project)
        rows = []
        for row in items[:100]:
            if not isinstance(row, dict):
                raise ValueError('Unreadable review item')
            import re
            if not re.fullmatch(r'[a-f0-9]{16}', str(row.get('id', ''))) or type(row.get('revision')) is not int or row['revision'] < 0:
                raise ValueError('Unreadable item identity')
            if row.get('state') not in {'awaiting-review', 'reviewed-approved', 'reviewed-rejected', 'revision-requested'}:
                raise ValueError('Unreadable review state')
            for key in ('title', 'body'):
                if not isinstance(row.get(key), str):
                    raise ValueError('Unreadable review text')
                hand.clean_text(row[key])
            rows.append({key: row.get(key) for key in ('id', 'title', 'body', 'state', 'revision', 'sources')})
        return {'project': project, 'items': rows, 'complete': len(items) <= 100,
                'execution_authorized': False, 'error': ''}
    except (OSError, ValueError, TypeError, KeyError):
        return {'project': project, 'items': [], 'complete': False,
                'execution_authorized': False, 'error': 'Review items could not be read. Refresh before taking an action.'}
