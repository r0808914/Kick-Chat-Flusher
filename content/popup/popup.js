window.addEventListener('DOMContentLoaded', (event) => {
  chrome.tabs.create({ url: 'https://kick.com/' });

  chrome.extension.getViews({ type: "popup" }).forEach(function (win) {
    win.close();
  });
});