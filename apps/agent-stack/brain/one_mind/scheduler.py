"""Worker-graph scheduler: dependency order plus safe-parallel batching.

Two nodes may share a batch only if neither depends on the other and they touch
no common file, worktree or exclusive resource. Execution order is deterministic.
"""

def _closure(nodes):
    by_id = {n['worker_id']: n for n in nodes}
    for n in nodes:
        for dep in n.get('dependencies', ()):
            if dep not in by_id:
                raise ValueError('unknown_dependency:' + dep)
    return by_id


def topo_order(nodes):
    by_id = _closure(nodes)
    done, order = set(), []
    pending = [n['worker_id'] for n in nodes]
    while pending:
        ready = [w for w in pending if set(by_id[w].get('dependencies', ())) <= done]
        if not ready:
            raise ValueError('dependency_cycle')
        for w in ready:
            order.append(w); done.add(w); pending.remove(w)
    return order


def conflicts(a, b):
    for key in ('files', 'worktrees', 'resources'):
        if set(a.get(key, ())) & set(b.get(key, ())):
            return key
    return None


def batches(nodes, max_parallel=3):
    by_id = _closure(nodes)
    order = topo_order(nodes)
    done, out = set(), []
    remaining = list(order)
    while remaining:
        batch = []
        for w in remaining:
            node = by_id[w]
            if not set(node.get('dependencies', ())) <= done:
                continue
            if len(batch) >= max_parallel or not node.get('parallelizable', True) and batch:
                continue
            if any(conflicts(node, by_id[o]) for o in batch):
                continue
            batch.append(w)
            if not node.get('parallelizable', True):
                break
        out.append(batch)
        done |= set(batch)
        remaining = [w for w in remaining if w not in done]
    return out


def dependents(nodes, roots):
    """roots plus everything downstream of them (the affected subgraph)."""
    affected, changed = set(roots), True
    while changed:
        changed = False
        for n in nodes:
            if n['worker_id'] not in affected and set(n.get('dependencies', ())) & affected:
                affected.add(n['worker_id']); changed = True
    return affected
