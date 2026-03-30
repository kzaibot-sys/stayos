(function () {
  'use strict';

  // Find the container element
  var container = document.getElementById('stayos-widget');
  if (!container) return;

  // Get hotel slug from container attribute or from the script tag itself
  var slug =
    container.getAttribute('data-hotel') ||
    (document.querySelector('script[data-hotel]') &&
      document.querySelector('script[data-hotel]').getAttribute('data-hotel'));

  if (!slug) {
    console.warn('[StayOS Widget] No hotel slug found. Set data-hotel attribute on #stayos-widget or the script tag.');
    return;
  }

  // Base URL — can be overridden with data-base-url attribute
  var baseUrl =
    container.getAttribute('data-base-url') ||
    'https://stayos.app';

  // Create iframe
  var iframe = document.createElement('iframe');
  iframe.src = baseUrl + '/' + slug + '/book?embedded=true';
  iframe.style.width = '100%';
  iframe.style.minHeight = '600px';
  iframe.style.height = '600px';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  iframe.style.display = 'block';
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('title', 'StayOS Booking Widget');
  iframe.setAttribute('allow', 'payment');

  // Listen for resize messages from the embedded page
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.type !== 'stayos-resize') return;
    if (typeof e.data.height === 'number' && e.data.height > 0) {
      iframe.style.height = e.data.height + 'px';
    }
  });

  // Clear container and append iframe
  container.innerHTML = '';
  container.appendChild(iframe);
})();
