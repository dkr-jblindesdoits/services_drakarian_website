/* ===== Cookie Consent — GDPR / Quebec Law 25 ===== */
/* Banner display, consent storage, analytics hook placeholder */

(function () {
  'use strict';

  var COOKIE_NAME = 'drakarian_cookie_consent';
  var COOKIE_DAYS = 365;

  /* ---------- i18n ---------- */
  var STRINGS = {
    en: {
      bannerText: 'This site uses cookies to improve your experience and for analytics purposes. You can accept or decline — the site works without cookies. <a href="./cookie-policy.html" style="color:var(--color-accent);text-decoration:underline;text-underline-offset:2px">Read our Cookie Policy</a>',
      accept: 'Accept',
      decline: 'Decline',
      prefsLink: 'Cookie Preferences'
    },
    fr: {
      bannerText: 'Ce site utilise des cookies pour améliorer votre expérience et à des fins d\u2019analyse. Vous pouvez accepter ou refuser — le site fonctionne sans cookies. <a href="./politique-cookies.html" style="color:var(--color-accent);text-decoration:underline;text-underline-offset:2px">Lire notre Politique de cookies</a>',
      accept: 'Accepter',
      decline: 'Refuser',
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

    if (choice === 'accepted') {
      // Placeholder: initialize analytics or tracking scripts here
      // e.g. loadAnalytics();
    }
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
    createBanner();
  }

  /* ---------- Init ---------- */

  function init() {
    initPrefsLinks();
    updatePrefsLinkText();

    var consent = getCookie(COOKIE_NAME);

    if (!consent) {
      // First visit — show banner, no content is blocked
      createBanner();
    }
    // Return visit — banner stays hidden, preference already stored
  }

  /* Expose updatePrefsLinkText so the site's language toggle can refresh cookie link text */
  window.cookieConsentUpdateLang = updatePrefsLinkText;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
