(() => {
  const setupMobileContact = () => {
    const hero = document.querySelector('[data-hero]');
    const finalCta = document.querySelector('[data-final]');
    const footer = document.querySelector('.site-footer');
    const mobileContact = document.querySelector('[data-mobile-contact]');

    if (!hero || !finalCta || !mobileContact || !('IntersectionObserver' in window)) return;

    let heroVisible = true;
    let finalVisible = false;
    let footerVisible = false;

    const syncBar = () => {
      mobileContact.classList.toggle('is-visible', !heroVisible && !finalVisible && !footerVisible);
    };

    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      syncBar();
    }, { threshold: 0.08 }).observe(hero);

    new IntersectionObserver(([entry]) => {
      finalVisible = entry.isIntersecting;
      syncBar();
    }, { threshold: 0.08 }).observe(finalCta);

    if (footer) {
      new IntersectionObserver(([entry]) => {
        footerVisible = entry.isIntersecting;
        syncBar();
      }, { threshold: 0.01 }).observe(footer);
    }
  };

  const setupSectionIndex = () => {
    const slot = document.querySelector('[data-section-index-slot]');
    const nav = document.querySelector('[data-section-index]');
    if (!slot || !nav) return;

    const links = [...nav.querySelectorAll('a[href^="#"]')];
    const targets = links
      .map((link) => ({ link, target: document.querySelector(link.getAttribute('href')) }))
      .filter((item) => item.target);
    const themedSections = [...document.querySelectorAll('[data-toolbar-theme]')];
    const themeClasses = ['theme-paper', 'theme-white', 'theme-dark', 'theme-red'];
    let ticking = false;
    let currentTheme = '';

    const setTheme = (theme) => {
      const safeTheme = ['paper', 'white', 'dark', 'red'].includes(theme) ? theme : 'paper';
      if (safeTheme === currentTheme) return;
      currentTheme = safeTheme;
      nav.classList.remove(...themeClasses);
      nav.classList.add(`theme-${safeTheme}`);
    };

    const update = () => {
      ticking = false;

      // Native sticky was flaky in the local browser setup; promote to a real fixed layer.
      const slotTop = slot.getBoundingClientRect().top;
      const floating = slotTop <= 0;
      slot.classList.toggle('is-floating', floating);

      if (!floating) {
        setTheme('paper');
      } else {
        const sampleY = Math.max(1, nav.getBoundingClientRect().height * 0.5);
        let theme = 'paper';
        for (const section of themedSections) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= sampleY && rect.bottom > sampleY) {
            theme = section.dataset.toolbarTheme || 'paper';
            break;
          }
        }
        setTheme(theme);
      }

      // Current navigation chapter: last anchor that has crossed the reading line.
      const readingLine = window.scrollY + nav.offsetHeight + 120;
      let active = null;
      for (const item of targets) {
        const top = item.target.getBoundingClientRect().top + window.scrollY;
        if (top <= readingLine) active = item;
      }
      for (const item of targets) {
        if (item === active) item.link.setAttribute('aria-current', 'location');
        else item.link.removeAttribute('aria-current');
      }

      // Keep the active item visible in the horizontally scrollable mobile toolbar.
      if (active && window.innerWidth <= 900) {
        const linkRect = active.link.getBoundingClientRect();
        const navRect = nav.getBoundingClientRect();
        if (linkRect.left < navRect.left + 12 || linkRect.right > navRect.right - 12) {
          active.link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    update();
  };


  const setupContactChoice = () => {
    const dialog = document.querySelector('[data-contact-dialog]');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    const context = dialog.querySelector('[data-contact-context]');
    const wa = dialog.querySelector('[data-contact-wa]');
    const vk = dialog.querySelector('[data-contact-vk]');
    const vkDetail = dialog.querySelector('[data-contact-vk-detail]');
    const close = dialog.querySelector('[data-contact-close]');

    const options = {
      rental: {
        context: 'Аренда студии · 900 ₽ / 30 мин · 1 500 ₽ / 60 мин',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%20%D1%81%D1%82%D1%83%D0%B4%D0%B8%D1%8E%20SIRIUS.%20%D0%9F%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5%20%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%BD%D0%BE%D0%B5%20%D0%B2%D1%80%D0%B5%D0%BC%D1%8F.%20%D0%98%D0%BD%D1%82%D0%B5%D1%80%D0%B5%D1%81%D1%83%D0%B5%D1%82%20%D0%B0%D1%80%D0%B5%D0%BD%D0%B4%D0%B0%20%D0%BD%D0%B0%2030%20%D0%B8%D0%BB%D0%B8%2060%20%D0%BC%D0%B8%D0%BD%D1%83%D1%82.',
        vk: 'https://vk.ru/market/product/arenda-fotostudii-228520100-10341585',
        vkDetail: 'Откроется товар «Аренда фотостудии»',
        waEvent: 'contact_whatsapp_rental',
        vkEvent: 'open_vk_rental'
      },
      shoot: {
        context: 'Фотосессия со штатным фотографом · 5 000 ₽ / 1 час',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%84%D0%BE%D1%82%D0%BE%D1%81%D0%B5%D1%81%D1%81%D0%B8%D1%8E%20%D1%81%D0%BE%20%D1%88%D1%82%D0%B0%D1%82%D0%BD%D1%8B%D0%BC%20%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%BE%D0%BC%20SIRIUS.%20%D0%9F%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5%20%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%BD%D1%83%D1%8E%20%D0%B4%D0%B0%D1%82%D1%83.',
        vk: 'https://vk.ru/market/product/shtatny-fotograf-228520100-10341537',
        vkDetail: 'Откроется товар «Штатный фотограф»',
        waEvent: 'contact_whatsapp_shoot',
        vkEvent: 'open_vk_shoot'
      },
      makeup: {
        context: 'Макияж · от 2 000 ₽',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%B4%D0%BE%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%20%D0%BC%D0%B0%D0%BA%D0%B8%D1%8F%D0%B6%20%D0%BA%20%D1%81%D1%8A%D1%91%D0%BC%D0%BA%D0%B5%20%D0%B2%20SIRIUS.%20%D0%9F%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5%20%D0%B4%D0%BE%D1%81%D1%82%D1%83%D0%BF%D0%BD%D1%8B%D0%B5%20%D0%B2%D0%B0%D1%80%D0%B8%D0%B0%D0%BD%D1%82%D1%8B%20%D0%B8%20%D0%B2%D1%80%D0%B5%D0%BC%D1%8F.',
        vk: 'https://vk.ru/market/product/makiyazh-228520100-10945743',
        vkDetail: 'Откроется товар «Макияж»',
        waEvent: 'contact_whatsapp_makeup',
        vkEvent: 'open_vk_makeup'
      },
      certificate: {
        context: 'Подарочный сертификат · от 5 000 ₽',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BE%D1%84%D0%BE%D1%80%D0%BC%D0%B8%D1%82%D1%8C%20%D0%BF%D0%BE%D0%B4%D0%B0%D1%80%D0%BE%D1%87%D0%BD%D1%8B%D0%B9%20%D1%81%D0%B5%D1%80%D1%82%D0%B8%D1%84%D0%B8%D0%BA%D0%B0%D1%82%20SIRIUS%20%D0%BD%D0%B0%20%D1%84%D0%BE%D1%82%D0%BE%D1%81%D0%B5%D1%81%D1%81%D0%B8%D1%8E%20%D1%81%D0%BE%20%D1%88%D1%82%D0%B0%D1%82%D0%BD%D1%8B%D0%BC%20%D1%84%D0%BE%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%BE%D0%BC.%20%D0%9F%D0%BE%D0%B4%D1%81%D0%BA%D0%B0%D0%B6%D0%B8%D1%82%D0%B5%2C%20%D0%BF%D0%BE%D0%B6%D0%B0%D0%BB%D1%83%D0%B9%D1%81%D1%82%D0%B0%2C%20%D0%BF%D0%BE%20%D0%BE%D1%84%D0%BE%D1%80%D0%BC%D0%BB%D0%B5%D0%BD%D0%B8%D1%8E.',
        vk: 'https://vk.ru/market/product/podarochny-sertifikat-1-chas-228520100-10341568',
        vkDetail: 'Откроется товар «Подарочный сертификат»',
        waEvent: 'contact_whatsapp_certificate',
        vkEvent: 'open_vk_certificate'
      },
      booking: {
        context: 'Проверить свободное время в SIRIUS',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D1%82%D0%BE%D1%87%D0%BD%D0%B8%D1%82%D1%8C%20%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%BD%D0%BE%D0%B5%20%D0%B2%D1%80%D0%B5%D0%BC%D1%8F%20%D0%B2%20SIRIUS.',
        vk: 'https://vk.me/siriusstudio',
        vkDetail: 'Откроются сообщения сообщества',
        waEvent: 'contact_whatsapp_booking',
        vkEvent: 'contact_vk_booking'
      },
      final: {
        context: 'Обсудить съёмку в SIRIUS',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BE%D0%B1%D1%81%D1%83%D0%B4%D0%B8%D1%82%D1%8C%20%D1%81%D1%8A%D1%91%D0%BC%D0%BA%D1%83%20%D0%B2%20SIRIUS.',
        vk: 'https://vk.me/siriusstudio',
        vkDetail: 'Откроются сообщения сообщества',
        waEvent: 'contact_whatsapp_final',
        vkEvent: 'contact_vk_final'
      },
      mobile: {
        context: 'Проверить дату для съёмки в SIRIUS',
        wa: 'https://wa.me/79520678015?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D1%80%D0%BE%D0%B2%D0%B5%D1%80%D0%B8%D1%82%D1%8C%20%D1%81%D0%B2%D0%BE%D0%B1%D0%BE%D0%B4%D0%BD%D1%83%D1%8E%20%D0%B4%D0%B0%D1%82%D1%83%20%D0%B4%D0%BB%D1%8F%20%D1%81%D1%8A%D1%91%D0%BC%D0%BA%D0%B8%20%D0%B2%20SIRIUS.',
        vk: 'https://vk.me/siriusstudio',
        vkDetail: 'Откроются сообщения сообщества',
        waEvent: 'contact_whatsapp_mobile',
        vkEvent: 'contact_vk_mobile'
      }
    };

    const openFor = (trigger) => {
      const option = options[trigger.dataset.contactKey];
      if (!option) return;
      context.textContent = option.context;
      wa.href = option.wa;
      vk.href = option.vk;
      vkDetail.textContent = option.vkDetail;
      wa.dataset.event = option.waEvent;
      vk.dataset.event = option.vkEvent;
      dialog.showModal();
      requestAnimationFrame(() => wa.focus({ preventScroll: true }));
    };

    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-contact-choice]');
      if (!trigger) return;
      event.preventDefault();
      openFor(trigger);
    });

    close?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.querySelectorAll('.contact-channel').forEach((link) => {
      link.addEventListener('click', () => dialog.close());
    });
  };
  setupContactChoice();
  setupMobileContact();
  setupSectionIndex();
})();