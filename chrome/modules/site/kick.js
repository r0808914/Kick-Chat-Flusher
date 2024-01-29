import { Flusher } from '../flusher/flusher.js';
import { createChat } from '../interface/overlay.js';
class Kick {

  static init() {
    console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Initialize');

    let stopObserver = false;

    if (document.querySelector(".video-js")) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK video found');
      const video = document.getElementsByTagName('video')[0];
      const flusher = new Flusher(video, "KICK", 0);
      createChat(flusher);
      return;
    }

    console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK start video observer');
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (!stopObserver && mutation.addedNodes) {
          mutation.addedNodes.forEach(function (node) {
            if (document.querySelector(".video-js")) {
              console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK stop video observer');
              observer.disconnect();
              stopObserver = true;
              const video = document.getElementsByTagName('video')[0];
              const flusher = new Flusher(video, "KICK", 0);
              createChat(flusher);
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

export default Kick;