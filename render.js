(function () {
  function setButtonLoading(button, isLoading, label) {
    if (!button) return;
    if (isLoading) {
      if (!button.dataset.idleText) button.dataset.idleText = button.textContent;
      button.textContent = label || button.dataset.idleText;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      return;
    }
    button.textContent = button.dataset.idleText || button.textContent;
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }

  function setMessage(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message || '';
    element.dataset.type = type;
  }

  function focusFirstInteractive(container) {
    if (!container) return;
    const target = container.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (target && typeof target.focus === 'function') target.focus();
  }

  function trapTabKey(event, container) {
    if (event.key !== 'Tab' || !container) return;
    const focusable = Array.from(container.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  window.SomthingreatRender = {
    setButtonLoading,
    setMessage,
    focusFirstInteractive,
    trapTabKey
  };
})();
