/* SIRIUS DARK EDITORIAL: client-only interactions, no simulated backend. */
(() => {
  'use strict';

  const menuButton = document.querySelector('[data-menu-toggle]');
  const navigation = document.querySelector('[data-nav]');
  const header = document.querySelector('[data-header]');
  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Открыть меню');
  };
  menuButton?.addEventListener('click', () => {
    const opening = !document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', opening);
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Закрыть меню' : 'Открыть меню');
  });
  navigation?.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (!menuButton?.contains(event.target) && !navigation?.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => { if (window.innerWidth > 950) closeMenu(); });
  window.addEventListener('scroll', () => header?.classList.toggle('is-scrolled', scrollY > 40), {passive:true});

  // Gallery: filter only real, owned source photographs, no fabricated studio category.
  const filterRoot = document.querySelector('[data-filters]');
  const gallery = document.querySelector('[data-gallery]');
  const shots = [...document.querySelectorAll('.port-photo[data-category]')];
  filterRoot?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filterRoot.contains(button)) return;
    const value = button.dataset.filter;
    filterRoot.querySelectorAll('button').forEach((node) => {
      node.setAttribute('aria-pressed', String(node === button));
    });
    shots.forEach((shot) => {
      shot.hidden = value !== 'all' && shot.dataset.category !== value;
    });
    gallery?.classList.toggle('is-filtered', value !== 'all');
  });

  // Lightbox: native dialog traps focus; Esc, ArrowLeft/Right, close and backdrop.
  const dialog = document.querySelector('[data-lightbox]');
  const dialogImage = dialog?.querySelector('[data-lightbox-image]');
  const dialogCaption = dialog?.querySelector('[data-lightbox-caption]');
  const openerButtons = [...document.querySelectorAll('.photo-open[data-full]')];
  let currentIndex = 0;
  let returnFocus = null;

  const visibleButtons = () => openerButtons.filter((button) => !button.closest('.port-photo')?.hidden);
  const displayImage = (buttons, index) => {
    if (!buttons.length || !dialogImage) return;
    currentIndex = (index + buttons.length) % buttons.length;
    const button = buttons[currentIndex];
    const picture = button.querySelector('img');
    dialogImage.src = button.dataset.full || '';
    dialogImage.alt = picture?.alt || 'Фотография из портфолио SIRIUS';
    if (dialogCaption) dialogCaption.textContent = button.dataset.caption || 'Фотостудия SIRIUS';
  };
  const stepImage = (delta) => {
    const buttons = visibleButtons();
    displayImage(buttons, currentIndex + delta);
  };

  openerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (!dialog || typeof dialog.showModal !== 'function') {
        const link = button.dataset.full;
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
        return;
      }
      returnFocus = button;
      const buttons = visibleButtons();
      displayImage(buttons, buttons.indexOf(button));
      dialog.showModal();
      dialog.querySelector('[data-gallery-close]')?.focus({preventScroll:true});
    });
  });
  dialog?.querySelector('[data-gallery-close]')?.addEventListener('click', () => dialog.close());
  dialog?.querySelector('[data-gallery-prev]')?.addEventListener('click', () => stepImage(-1));
  dialog?.querySelector('[data-gallery-next]')?.addEventListener('click', () => stepImage(1));
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => {
    if (dialogImage) dialogImage.src = 'assets/img/responsive/editorial-25-480.jpg';
    returnFocus?.focus({preventScroll:true});
    returnFocus = null;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
    if (!dialog?.open) return;
    if (event.key === 'ArrowLeft') {event.preventDefault();stepImage(-1);}
    if (event.key === 'ArrowRight') {event.preventDefault();stepImage(1);}
  });

  // Prepare a customer inquiry in existing WhatsApp channel.
  // IMPORTANT: no claim that the booking is saved or that dates are available.
  const form = document.querySelector('[data-booking-form]');
  const format = form?.querySelector('#form-format');
  const phone = form?.querySelector('#form-phone');
  const result = form?.querySelector('[data-form-result]');
  const dateInput = form?.querySelector('#form-date');
  const submit = form?.querySelector('[data-submit]');
  const formats = {
    rent30: 'Аренда фотостудии 30 минут, 900 ₽',
    rent60: 'Аренда фотостудии 60 минут, 1 500 ₽',
    shoot: 'Фотосессия со штатным фотографом (уточнить стоимость)',
    other: 'Обсудить условия съёмки'
  };
  const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
  const localToday = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  };
  if (dateInput) dateInput.min = localToday();
  phone?.addEventListener('input', () => {phone.setCustomValidity('');phone.removeAttribute('aria-invalid');});
  form?.addEventListener('invalid', (event) => {
    event.target?.setAttribute('aria-invalid', 'true');
    if (result) result.textContent = 'Проверьте обязательные поля и формат данных перед продолжением.';
  }, true);

  document.querySelectorAll('a[data-preselect]').forEach((link) => {
    link.addEventListener('click', () => {
      if (format) format.value = link.dataset.preselect === 'rent' ? 'rent60' : 'shoot';
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const number = clean(phone?.value || '');
    const digitCount = number.replace(/\D/g, '').length;
    if (phone && (digitCount < 10 || digitCount > 15)) {
      phone.setCustomValidity('Укажите действительный номер: от 10 до 15 цифр.');
      phone.reportValidity();
      phone.focus();
      return;
    }
    phone?.setCustomValidity('');
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = clean(data.get('name'));
    const selection = clean(data.get('format'));
    const iso = clean(data.get('date'));
    const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso.split('-').reverse().join('.') : '';
    const notes = clean(data.get('comment'));
    const message = [
      'Здравствуйте! Хочу обсудить съёмку в фотостудии SIRIUS.',
      'Имя: ' + name,
      'Телефон для связи: ' + number,
      'Формат: ' + (formats[selection] || 'Уточнить условия'),
      date ? 'Желаемая дата: ' + date : '',
      notes ? 'Комментарий: ' + notes : '',
      'Подскажите, пожалуйста, свободное время и условия записи.'
    ].filter(Boolean).join('\n');
    const url = 'https://wa.me/79520678015?text=' + encodeURIComponent(message);

    // Persistent functional fallback is rendered BEFORE navigation attempt.
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Открыть подготовленное сообщение ↗';
    if (result) {
      result.textContent = 'Сообщение подготовлено. Отправьте его в WhatsApp, чтобы студия подтвердила запись. ';
      result.appendChild(link);
    }
    // A visible loading state is intentionally not faked: there is no async backend.
    submit?.setAttribute('aria-busy', 'true');
    link.click(); // synchronous under real submit gesture; popup blockers may require clicking fallback.
    submit?.removeAttribute('aria-busy');
  });

  const sticky = document.querySelector('[data-mobile-contact]');
  const hero = document.querySelector('[data-hero]');
  const booking = document.querySelector('[data-final]');
  const contacts = document.querySelector('#contacts');
  if (sticky && hero && booking && contacts && 'IntersectionObserver' in window) {
    const seen = {hero:true,booking:false,contacts:false};
    const sync = () => sticky.classList.toggle('is-visible', !seen.hero && !seen.booking && !seen.contacts);
    for (const [node,key] of [[hero,'hero'],[booking,'booking'],[contacts,'contacts']]) {
      new IntersectionObserver(([entry]) => {seen[key] = entry.isIntersecting;sync();},{threshold:.08}).observe(node);
    }
  }
})();