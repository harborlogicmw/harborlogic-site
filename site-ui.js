/* Shared navigation for the homepage, workshops, and generated blog pages. */
(() => {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !links || !overlay) return;

  const mobile = window.matchMedia('(max-width: 880px)');
  let savedOverflow = null;

  function setOpen(open, restoreFocus = false) {
    open = open && mobile.matches;
    toggle.classList.toggle('open', open);
    links.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      if (savedOverflow === null) savedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      links.querySelector('a')?.focus();
    } else {
      if (savedOverflow !== null) document.body.style.overflow = savedOverflow;
      savedOverflow = null;
      if (restoreFocus) toggle.focus();
    }
  }

  toggle.addEventListener('click', () => {
    const wasOpen = toggle.getAttribute('aria-expanded') === 'true';
    setOpen(!wasOpen, wasOpen);
  });
  overlay.addEventListener('click', () => setOpen(false, true));
  links.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false, mobile.matches);
  });
  document.addEventListener('keydown', event => {
    if (toggle.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    } else if (event.key === 'Tab') {
      const controls = [toggle, ...links.querySelectorAll('a[href]')];
      const current = controls.indexOf(document.activeElement);
      const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[next].focus();
    }
  });
  mobile.addEventListener('change', () => {
    const focusInLinks = links.contains(document.activeElement);
    const focusOnToggle = document.activeElement === toggle;
    setOpen(false, mobile.matches && focusInLinks);
    if (!mobile.matches && focusOnToggle) links.querySelector('a')?.focus();
  });
})();
