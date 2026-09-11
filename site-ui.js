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

/* Newsletter signup: submit inline instead of navigating to Formspree.
   Without JavaScript the form still posts natively, so signup keeps working. */
(() => {
  const forms = document.querySelectorAll('form.newsletter-form');
  if (!forms.length) return;

  forms.forEach(form => {
    const button = form.querySelector('button[type="submit"]');
    const original = button ? button.textContent : '';

    const status = document.createElement('p');
    status.className = 'newsletter-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.insertAdjacentElement('afterend', status);

    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (button) {
        button.disabled = true;
        button.textContent = 'Sending...';
      }
      status.className = 'newsletter-status';
      status.textContent = '';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error('Submission failed');
        status.className = 'newsletter-status success';
        status.textContent = 'You’re on the list. New field notes land in your inbox.';
        form.reset();
        if (button) button.textContent = 'Subscribed';
      } catch (err) {
        status.className = 'newsletter-status error';
        status.textContent = 'Something went wrong. Please try again or email info@harborlogic.cc.';
        if (button) {
          button.textContent = original;
          button.disabled = false;
        }
      }
    });
  });
})();
