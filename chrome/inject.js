(function () {
  const b = typeof browser !== 'undefined' ? browser : chrome;
  const content = b.runtime.getURL('./modules/content.js');
  import(content);
})();