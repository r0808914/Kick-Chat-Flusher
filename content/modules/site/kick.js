import { Flusher } from '../flusher/flusher.js';
import { createChat } from '../interface/overlay.js';
import { logToConsole } from '../utils/utils.js';
class Kick {

  static init() {
    logToConsole(`Initialize`)

    let stopObserver = false;
    let shouldReturn = true;

    let video = document.querySelector(".video-js");
    let username = document.querySelector(".stream-username");

    if (video && username) {
      logToConsole(`KICK video found`)

      const video = document.getElementsByTagName('video')[0];
      const flusher = new Flusher(video, "KICK");
      try {
        createChat(flusher);
      } catch (error) {
        shouldReturn = false;
        logToConsole(`Failed to create chat`)
      }

      if (shouldReturn) return;
    }

    logToConsole(`KICK start video observer`)

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (!stopObserver && mutation.addedNodes) {
          mutation.addedNodes.forEach(function (node) {
            if (document.querySelector(".stream-username")) {
              if (document.querySelector(".video-js")) {
                logToConsole(`KICK stop video observer`)
                stopObserver = true;
                const video = document.getElementsByTagName('video')[0];
                const flusher = new Flusher(video, "KICK");
                try {
                  createChat(flusher);
                } catch (error) {
                  stopObserver = false;
                  logToConsole(`Failed to create chat`)
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