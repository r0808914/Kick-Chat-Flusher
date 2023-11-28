; (function () {

  const b = typeof browser !== 'undefined' ? browser : chrome

  const cssFileURL = chrome.runtime.getURL('overlay.css');

  const metaTag = document.createElement('meta');
  metaTag.name = 'chat-flusher-css';
  metaTag.content = cssFileURL;
  document.head.appendChild(metaTag);

  const script = document.createElement('script')
  script.src = b.runtime.getURL('content.js')

  document.documentElement.appendChild(script)
})()