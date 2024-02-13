import { Flusher } from '../flusher/flusher.js';
import { createChat } from '../interface/overlay.js';
class Kick {

  static init() {
    console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Initialize');
    let stopObserver = false;
    let shouldReturn = true;

    let video = document.querySelector(".video-js");
    let username = document.querySelector(".stream-username");

    if (video && username) {
      console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK video found');
      const video = document.getElementsByTagName('video')[0];
      const flusher = new Flusher(video, "KICK");
      try {
        createChat(flusher);
      } catch (error) {
        shouldReturn = false;
        console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Failed to create chat');
      }

      if (shouldReturn) return;
    }

    console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK start video observer');
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (!stopObserver && mutation.addedNodes) {
          mutation.addedNodes.forEach(function (node) {
            if (document.querySelector(".stream-username")) {
              if (document.querySelector(".video-js")) {
                console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m KICK stop video observer');
                stopObserver = true;
                const video = document.getElementsByTagName('video')[0];
                const flusher = new Flusher(video, "KICK");
                try {
                  createChat(flusher);
                } catch (error) {
                  stopObserver = false;
                  console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Failed to create chat');
                }

                if (stopObserver) observer.disconnect();
              }
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