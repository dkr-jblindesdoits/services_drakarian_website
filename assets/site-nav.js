/* =========================================================================
   Shared site navigation — single source of truth for all pages.
   Injects the desktop nav + mobile menu into the <div id="site-nav"></div>
   placeholder. Must run as a BLOCKING script (no defer/async) so the nav
   exists before each page's DOMContentLoaded handler wires up the theme
   toggle, language toggle, burger menu and sticky-nav behaviour.

   Links carry data-i18n keys, so the page's existing setLanguage() handles
   translation automatically (index.html / projects.html share that system).
   To add, remove or reorder a nav link, edit the LINKS array below — once.
   ========================================================================= */
(function () {
  var page = location.pathname.split('/').pop();
  var isHome = page === '' || page === 'index.html';
  // Same-page anchors on the homepage (smooth scroll); cross-page back to
  // the homepage everywhere else.
  function href(anchor) { return (isHome ? '' : './') + anchor; }
  var logoHref = isHome ? '#' : './';

  // [ i18n key suffix, English fallback text ]. Fallback is shown only until
  // setLanguage() runs; every key must exist in each page's T dictionary.
  var LINKS = [
    ['services', 'Services'],
    ['ai', 'AI'],
    ['process', 'Process'],
    ['projects', 'Projects'],
    ['contact', 'Contact']
  ];

  var TOGGLES =
    '<button class="theme-toggle" aria-label="Toggle dark mode">' +
      '<div class="theme-toggle__icons">' +
        '<svg class="icon-sun" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>' +
        '<svg class="icon-moon" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
      '</div>' +
      '<div class="theme-toggle__thumb"></div>' +
    '</button>' +
    '<button class="lang-toggle">FR</button>';

  var desktopLinks = LINKS.map(function (l) {
    return '<li><a href="' + href('#' + l[0]) + '" data-i18n="nav.' + l[0] + '">' + l[1] + '</a></li>';
  }).join('');

  var mobileLinks = LINKS.map(function (l) {
    return '<a href="' + href('#' + l[0]) + '" class="mobile-link" data-i18n="nav.' + l[0] + '">' + l[1] + '</a>';
  }).join('');

  var html =
    '<nav class="nav" id="nav" aria-label="Main navigation">' +
      '<div class="nav__inner">' +
        '<a href="' + logoHref + '" class="nav__logo">Services <span>Drakarian</span> Inc.</a>' +
        '<ul class="nav__links">' +
          desktopLinks +
          '<li><div class="nav__toggles">' + TOGGLES + '</div></li>' +
          '<li><a href="' + href('#contact') + '" class="btn btn--primary" data-i18n="nav.cta">Book a Call</a></li>' +
        '</ul>' +
        '<div class="nav__right-group nav__toggles--mobile">' +
          '<div class="nav__toggles">' + TOGGLES + '</div>' +
          '<button class="nav__burger" id="burger" aria-label="Toggle menu"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
    '</nav>' +
    '<div class="nav__mobile" id="mobile-menu">' +
      mobileLinks +
      '<a href="' + href('#contact') + '" class="btn btn--primary mobile-link" data-i18n="nav.cta">Book a Call</a>' +
    '</div>';

  var mount = document.getElementById('site-nav');
  if (mount) mount.outerHTML = html;
})();
