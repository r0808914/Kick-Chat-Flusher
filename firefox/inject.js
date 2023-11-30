; (function () {

  const b = typeof browser !== 'undefined' ? browser : chrome

  const dataFileURL = chrome.runtime.getURL('data.html');

  const metaTag = document.createElement('meta');
  metaTag.name = 'chat-flusher-data';
  metaTag.content = dataFileURL;
  document.head.appendChild(metaTag);

  const script = document.createElement('script')
  script.src = b.runtime.getURL('content.js')

  document.documentElement.appendChild(script)
})()