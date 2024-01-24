(function () {
  console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Inject');
  const b = typeof browser !== 'undefined' ? browser : chrome;
  const content = b.runtime.getURL('./modules/content.js');
  import(content);
})();