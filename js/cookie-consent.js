(function () {
  if (localStorage.getItem('hd_cookie_consent')) return;

  var base = location.pathname.includes('/blog/') ? '../' : '';

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML =
    '<p>This site may use cookies and similar technologies to improve browsing, support site functionality, and help with advertising measurement. You can accept the default experience or review our privacy information.</p>' +
    '<div class="cookie-actions">' +
      '<a href="' + base + 'privacy-policy.html" class="btn-outline btn-sm" tabindex="0">Privacy Policy</a>' +
      '<button id="cookie-accept" class="btn btn-sm" tabindex="0">Accept</button>' +
    '</div>';

  document.body.appendChild(banner);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { banner.classList.add('cookie-visible'); });
  });

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('hd_cookie_consent', '1');
    banner.style.opacity = '0';
    banner.style.transform = 'translateX(-50%) translateY(120px)';
    setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 420);
  });
})();
