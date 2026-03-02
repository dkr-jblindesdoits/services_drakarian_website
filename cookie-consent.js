/* ===== Cookie Consent — GDPR / Quebec Law 25 ===== */
/* Single-responsibility module: banner display, consent storage, Calendly gating */

(function () {
  'use strict';

  var COOKIE_NAME = 'drakarian_cookie_consent';
  var COOKIE_DAYS = 365;
  var CALENDLY_SCRIPT_SRC = 'https://assets.calendly.com/assets/external/widget.js';
  var CALENDLY_URL = 'https://calendly.com/jblindesdoits-drakarian/30min';

  /* ---------- i18n ---------- */
  var STRINGS = {
    en: {
      bannerText: 'This site uses third-party cookies to embed our scheduling widget (Calendly). You can accept or decline — the rest of the site works without cookies.',
      accept: 'Accept',
      decline: 'Decline',
      fallbackText: 'The scheduling widget is disabled because third-party cookies were declined. You can book directly on Calendly:',
      fallbackLink: 'Book on Calendly',
      prefsLink: 'Cookie Preferences'
    },
    fr: {
      bannerText: 'Ce site utilise des cookies tiers pour intégrer notre outil de prise de rendez-vous (Calendly). Vous pouvez accepter ou refuser — le reste du site fonctionne sans cookies.',
      accept: 'Accepter',
      decline: 'Refuser',
      fallbackText: 'Le widget de planification est désactivé car les cookies tiers ont été refusés. Vous pouvez réserver directement sur Calendly\u00a0:',
      fallbackLink: 'Réserver sur Calendly',
      prefsLink: 'Préférences cookies'
    }
  };

  /* ---------- Helpers ---------- */

  /** Detect language: check site lang toggle state, then localStorage, then navigator */
  function getLang() {
    var stored = localStorage.getItem('drak-lang');
    if (stored === 'fr') return 'fr';
    if (stored === 'en') return 'en';
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return nav.startsWith('fr') ? 'fr' : 'en';
  }

  function t(key) {
    var lang = getLang();
    return STRINGS[lang][key] || STRINGS.en[key];
  }

  /** Read a first-party cookie by name */
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  /** Set a first-party cookie */
  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + encodeURIComponent(value) +
      '; expires=' + d.toUTCString() +
      '; path=/; SameSite=Lax; Secure';
  }

  /** Delete a cookie */
  function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure';
  }

  /* ---------- Banner ---------- */

  function createBanner() {
    var banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.id = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    banner.innerHTML =
      '<div class="cc-banner__inner">' +
        '<div class="cc-banner__text">' + t('bannerText') + '</div>' +
        '<div class="cc-banner__actions">' +
          '<button class="cc-btn cc-btn--decline" id="cc-decline">' + t('decline') + '</button>' +
          '<button class="cc-btn cc-btn--accept" id="cc-accept">' + t('accept') + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    // Fade in on next frame
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('cc-visible');
      });
    });

    document.getElementById('cc-accept').addEventListener('click', function () {
      onConsent('accepted');
    });

    document.getElementById('cc-decline').addEventListener('click', function () {
      onConsent('declined');
    });
  }

  function hideBanner() {
    var banner = document.getElementById('cc-banner');
    if (!banner) return;
    banner.classList.remove('cc-visible');
    banner.addEventListener('transitionend', function () {
      if (banner.parentNode) banner.parentNode.removeChild(banner);
    }, { once: true });
  }

  /* ---------- Consent handler ---------- */

  function onConsent(choice) {
    setCookie(COOKIE_NAME, choice, COOKIE_DAYS);
    hideBanner();
    applyConsent(choice);
  }

  /* ---------- Calendly gating ---------- */

  function applyConsent(choice) {
    var embed = document.getElementById('calendly-embed');
    if (!embed) return; // Not on index page

    if (choice === 'accepted') {
      loadCalendly(embed);
    } else {
      showFallback(embed);
    }
  }

  /** Dynamically load the Calendly widget script and initialize the embed */
  function loadCalendly(container) {
    // Remove fallback if present
    var fallback = container.querySelector('.calendly-fallback');
    if (fallback) fallback.remove();

    // Restore the inline widget div if it was hidden
    var widget = container.querySelector('.calendly-inline-widget');
    if (widget) {
      widget.style.display = '';
    }

    // Only load the script once
    if (document.querySelector('script[src="' + CALENDLY_SCRIPT_SRC + '"]')) return;

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    container.appendChild(script);
  }

  /** Show a fallback message with a direct link to Calendly */
  function showFallback(container) {
    // Hide the Calendly widget div
    var widget = container.querySelector('.calendly-inline-widget');
    if (widget) widget.style.display = 'none';

    // Remove the Calendly script if it was loaded
    var script = document.querySelector('script[src="' + CALENDLY_SCRIPT_SRC + '"]');
    if (script && script.parentNode) script.parentNode.removeChild(script);

    // Don't duplicate fallback
    if (container.querySelector('.calendly-fallback')) return;

    var fallbackDiv = document.createElement('div');
    fallbackDiv.className = 'calendly-fallback';
    fallbackDiv.innerHTML =
      '<div class="calendly-fallback__text">' + t('fallbackText') + '</div>' +
      '<a href="' + CALENDLY_URL + '" target="_blank" rel="noopener noreferrer" class="calendly-fallback__link">' +
        t('fallbackLink') +
        ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>' +
      '</a>';

    container.appendChild(fallbackDiv);
  }

  /* ---------- Footer preferences link ---------- */

  function initPrefsLinks() {
    document.querySelectorAll('.cc-prefs-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        resetConsent();
      });
    });
  }

  /** Update the text of all cookie preferences links to match current language */
  function updatePrefsLinkText() {
    document.querySelectorAll('.cc-prefs-link').forEach(function (link) {
      link.textContent = t('prefsLink');
    });
  }

  function resetConsent() {
    deleteCookie(COOKIE_NAME);

    // Restore Calendly widget div visibility and remove fallback
    var embed = document.getElementById('calendly-embed');
    if (embed) {
      var widget = embed.querySelector('.calendly-inline-widget');
      if (widget) widget.style.display = 'none';
      var fallback = embed.querySelector('.calendly-fallback');
      if (fallback) fallback.remove();
      // Remove loaded Calendly script so it can be re-loaded on accept
      var script = document.querySelector('script[src="' + CALENDLY_SCRIPT_SRC + '"]');
      if (script && script.parentNode) script.parentNode.removeChild(script);
    }

    createBanner();
  }

  /* ---------- Init ---------- */

  function init() {
    initPrefsLinks();
    updatePrefsLinkText();

    var consent = getCookie(COOKIE_NAME);

    if (!consent) {
      // First visit — hide Calendly widget until consent is given
      var embed = document.getElementById('calendly-embed');
      if (embed) {
        var widget = embed.querySelector('.calendly-inline-widget');
        if (widget) widget.style.display = 'none';
      }
      createBanner();
    } else {
      // Return visit — apply saved preference silently
      applyConsent(consent);
    }
  }

  /* Expose updatePrefsLinkText so the site's language toggle can refresh cookie link text */
  window.cookieConsentUpdateLang = updatePrefsLinkText;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
