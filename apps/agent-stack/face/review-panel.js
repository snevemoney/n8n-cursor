/* Existing project commands are the sole write path. Approval here reviews a
   local draft; it never grants send, publish, spend or execution authority. */
(function (global) {
  'use strict';
  function create(host, submit) {
    let current = null, signature = '', pending = false, expanded = true;
    function element(tag, text, parent) {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = String(text);
      parent.appendChild(node); return node;
    }
    function render() {
      host.replaceChildren(); host.hidden = !current;
      if (!current) return;
      const toggle = element('button', `Review drafts · ${current.project}`, host);
      toggle.type = 'button'; toggle.setAttribute('aria-expanded', String(expanded));
      toggle.onclick = () => { expanded = !expanded; render(); };
      if (!expanded) return;
      const refresh = element('button', 'Refresh queue', host);
      refresh.type = 'button';
      refresh.onclick = () => submit(`project ${current.project} review queue`);
      const body = element('div', undefined, host); body.className = 'review-body';
      element('p', 'Review only. Nothing is sent, published or authorized to run.', body);
      if (current.error) { element('p', current.error, body); return; }
      if (!current.complete) element('p', 'Showing the first 100 items. This queue view is incomplete.', body);
      if (!current.items.length) element('p', 'No drafts awaiting review.', body);
      for (const item of current.items) {
        const article = element('article', undefined, body);
        element('h3', item.title, article);
        element('p', `${item.state} · revision ${item.revision}`, article);
        const draft = element('textarea', undefined, article);
        draft.value = String(item.body || ''); draft.rows = 4;
        draft.setAttribute('aria-label', `Draft text: ${item.title}`);
        for (const action of ['approve', 'edit', 'reject', 'redo']) {
          const button = element('button', action[0].toUpperCase() + action.slice(1), article);
          button.type = 'button'; button.disabled = pending;
          button.onclick = async () => {
            if (pending || !current || !/^[a-f0-9]{16}$/.test(item.id) || !Number.isInteger(item.revision)) return;
            const replacement = draft.value;
            if (action === 'approve' && replacement !== String(item.body || '')) {
              element('p', 'Use Edit to save the changed text before approving it.', article); return;
            }
            const command = `project ${current.project} review ${item.id} ${action} revision ${item.revision}`
              + (action === 'edit' ? `: ${replacement}` : '');
            pending = true;
            for (const b of host.querySelectorAll('article button')) b.disabled = true;
            try { await submit(command); }
            catch (_) { element('p', 'The action did not finish. Refresh the review queue before retrying.', body); }
            // Keep disabled until a fresh receipt arrives, even when submission fails.
          };
        }
      }
    }
    return { paint(bus) {
      const receipt = bus && bus.execution;
      const view = receipt && receipt.project_view;
      if (!view || bus.job_status !== 'done' || Number(bus.execution_gen) !== Number(bus.turn_gen)
          || !/^[a-z0-9-]+$/.test(view.project) || !Array.isArray(view.items)) {
        current = null; signature = ''; pending = false; render(); return;
      }
      const next = JSON.stringify([bus.turn_gen, view]);
      if (next === signature) return;
      signature = next; current = view; pending = false; render();
    } };
  }
  global.JarvisReviewPanel = {create};
})(typeof window !== 'undefined' ? window : globalThis);
