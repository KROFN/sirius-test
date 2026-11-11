(() => {
  'use strict';

  const navToggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const header = document.querySelector('[data-header]');

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Открыть меню');
  };

  navToggle?.addEventListener('click', () => {
    const open = !document.body.classList.contains('nav-open');
    document.body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (nav?.contains(event.target) || navToggle?.contains(event.target)) return;
    closeMenu();
  });

  // Portfolio filtering changes actual pictures rather than simulating new content.
  const filters = document.querySelector('[data-filters]');
  const shots = [...document.querySelectorAll('.portfolio-shot[data-category]')];
  filters?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-filter]');
    if (!button || !filters.contains(button)) return;
    const category = button.dataset.filter;
    filters.querySelectorAll('button').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    shots.forEach((shot) => {
      shot.hidden = category !== 'all' && shot.dataset.category !== category;
    });
  });

  // Contact form doesn't imply a booking engine. It prepares the user's message.
  const form = document.querySelector('[data-booking-form]');
  const format = document.querySelector('#booking-format');
  const duration = document.querySelector('#booking-duration');
  const date = document.querySelector('#booking-date');
  const feedback = document.querySelector('[data-form-feedback]');

  const syncDuration = () => {
    const rent = format?.value === 'rent';
    const field = duration?.closest('.form-field');
    if (field) field.hidden = !rent;
    if (duration) {
      duration.required = rent;
      duration.disabled = !rent;
      if (!rent) duration.value = '';
    }
  };
  format?.addEventListener('change', syncDuration);
  syncDuration();

  const fmt = (value) => String(value || '').trim().replace(/\s+/g, ' ');
  const labels = {
    rent: 'Аренда фотостудии',
    shoot: 'Фотосессия со штатным фотографом',
    other: 'Уточнить условия'
  };
  const formatDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return '';
    const [year, month, day] = value.split('-');
    return day + '.' + month + '.' + year;
  };

  // Prefer local date to UTC to avoid rejecting valid requests near midnight.
  if (date) {
    const today = new Date();
    const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    date.min = local;
  }

  document.querySelectorAll('[data-preselect]').forEach((link) => {
    link.addEventListener('click', () => {
      if (!format) return;
      format.value = link.dataset.preselect;
      syncDuration();
    });
  });

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const selected = fmt(fields.get('format'));
    const lines = ['Здравствуйте! Хочу уточнить возможность записи в SIRIUS.', 'Формат: ' + (labels[selected] || 'Уточнить условия') + '.'];

    if (selected === 'rent') {
      const minutes = fmt(fields.get('duration'));
      if (minutes) lines.push('Аренда: ' + minutes + ' минут.');
    }
    const preferredDate = formatDate(fmt(fields.get('date')));
    if (preferredDate) lines.push('Желаемая дата: ' + preferredDate + '.');

    const name = fmt(fields.get('name'));
    if (name) lines.push('Имя: ' + name + '.');

    const comment = fmt(fields.get('comment'));
    if (comment) lines.push('Пожелания: ' + comment);

    lines.push('Подскажите, пожалуйста, свободное время и условия.');
    const url = 'https://wa.me/79520678015?text=' + encodeURIComponent(lines.join('\n'));

    // Keep an explicit accessible fallback; a blocked popup must not lose the request.
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Открыть подготовленное сообщение ↗';
    if (feedback) {
      feedback.textContent = 'Сообщение подготовлено. Отправка и подтверждение записи происходят в WhatsApp.';
      feedback.append(' ', link);
    }
    // Trigger navigation synchronously from the user's submit gesture.
    link.click();
  });

  // Keep mobile CTA outside the hero, hide it on form and contact screens.
  const sticky = document.querySelector('[data-mobile-contact]');
  const hero = document.querySelector('[data-hero]');
  const booking = document.querySelector('[data-final]');
  const contacts = document.querySelector('#contacts');
  if (sticky && hero && booking && 'IntersectionObserver' in window) {
    const seen = {hero:true, booking:false, contacts:false};
    const sync = () => {
      sticky.classList.toggle('is-visible', !seen.hero && !seen.booking && !seen.contacts);
    };
    [[hero,'hero'],[booking,'booking'],[contacts,'contacts']].forEach(([node,key]) => {
      if (!node) return;
      new IntersectionObserver(([entry]) => {
        seen[key] = entry.isIntersecting;
        sync();
      }, {threshold: .08}).observe(node);
    });
  }

  // Reduce non-essential motion and don't animate offscreen heavy imagery.
  if (header && 'IntersectionObserver' in window) {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!media.matches) {
      const sections = [...document.querySelectorAll('.section')];
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-entered');
            observer.unobserve(entry.target);
          }
        }
      }, {threshold: .06});
      sections.forEach((section) => observer.observe(section));
    }
  }
})();