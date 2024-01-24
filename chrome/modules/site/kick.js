import { Flusher } from '../flusher/flusher.js';

class Kick {
  static initialized = false;
  static loading = false;

  static init() {
    if (!Kick.initialized && !Kick.loading) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK');
      Kick.loading = true;

      const video = document.querySelector('video');
      if (document.querySelector("video") && document.querySelector(".video-js")) {
        const flusher = new Flusher(video, "KICK", 0);
        return;
      }

      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach(function (node) {
              if (document.querySelector(".video-js")) {
                observer.disconnect();
                const video = document.querySelector('video');
                const flusher = new Flusher(video, "KICK", 0);
                return;
              }
            });
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(function () {
        observer.disconnect();
        Kick.loading = false;
      }, 5000);
    }
  }
}

export default Kick;