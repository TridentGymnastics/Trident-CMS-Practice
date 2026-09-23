(() => {
  const collect = () =>
    Array.from(document.querySelectorAll('[data-edit-file][data-edit-field][id]'))
      .map(el => ({
        file: el.getAttribute('data-edit-file'),
        field: el.getAttribute('data-edit-field'),
        selector: `#${el.id}`,
      }));

  window.__VE_MAP__ = collect();

  const mo = new MutationObserver(() => (window.__VE_MAP__ = collect()));
  mo.observe(document.documentElement, { childList: true, subtree: true });

  const style = document.createElement('style');
  style.textContent = `
    [data-edit-file][data-edit-field][id]:hover {
      outline: 1px dashed rgba(99,102,241,.6);
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);
})();
