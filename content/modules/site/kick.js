import { Flusher } from '../flusher/flusher.js';
import { createChat } from '../interface/overlay.js';
import { logToConsole } from '../utils/utils.js';

class Kick {
  static init() {
    logToConsole(`Initialize`);

    let stopObserver = false;

    const observeVideo = () => {
      const videoObserver = new MutationObserver(() => {
        let video = document.getElementsByTagName('video');
        video = video[video.length - 1];

        if (video) {
          logToConsole(`KICK video found`);
          videoObserver.disconnect();

          setTimeout(() => {
            let video = document.getElementsByTagName('video');
            video = video[video.length - 1];

            let channelName = document.querySelector(".stream-username");

            if (channelName && video) {
              channelName = channelName.innerText.trim();
              const AeroKick = video.classList.contains('bk-aspect-video');
              if (AeroKick) logToConsole(`detected: AeroKick`);
              const flusher = new Flusher(video, "KICK", channelName, AeroKick);
              try {
                createChat(flusher);
                return;
              } catch (error) {
                logToConsole(`Failed to create chat`);
              }
            }

            logToConsole(`KICK start video observer`);

            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (!stopObserver && mutation.addedNodes) {
                  if (document.querySelector(".stream-username")) {
                    let video = document.getElementsByTagName('video');
                    video = video[video.length - 1];  
                    if (video) {
                      logToConsole(`KICK stop video observer`);
                      stopObserver = true;
                      const channelName = document.querySelector(".stream-username").innerText.trim()
                      const AeroKick = video.classList.contains('bk-aspect-video');
                      if (AeroKick) logToConsole(`detected: AeroKick`);
                      const flusher = new Flusher(video, "KICK", channelName, AeroKick);
                      try {
                        createChat(flusher);
                      } catch (error) {
                        stopObserver = false;
                        logToConsole(`Failed to create chat`);
                      }

                      if (stopObserver) observer.disconnect();
                    }
                  }
                }
              });
            });

            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          }, 1000);
        }
      });

      videoObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    };

    observeVideo();
  }
}

export default Kick;