import {
  toggleEnableMenu,
  togglePointerEvents,
} from "../interface/menu/menu.js";
import { processMessageQueue } from "../queue/queue.js";
import { logToConsole } from "./utils.js";
import { setCustomPosition } from "../interface/overlay.js";

import Kick from "../site/kick.js";

export function checkResize(flusher) {
  /* logToConsole("Check Resize"); */
  const target = flusher.props.external
    ? flusher.video
    : flusher.video.querySelector("video") ?? flusher.video;

  flusher.resizeTimer = null;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = new ResizeObserver((entries) => {
    if (flusher.container !== null) flusher.container.style.display = "none";

    for (let entry of entries) {
      if (flusher.resizeTimer) clearTimeout(flusher.resizeTimer);
      flusher.resizeTimer = setTimeout(() => {
        for (let entry of entries) {

          const rect = target.getBoundingClientRect();
          let width = rect.width;
          let height = rect.height;

          window.currentUrl = window.location.href;

          if ((width === null || width === 0) && (!height || height === 0)) {
            if (flusher !== null) {
              /* logToConsole("Remove Chat"); */
              const init = !flusher.props.external;
              flusher.resizeObserver.disconnect();
              flusher.resizeObserver = null;
              for (const id of flusher.props.timeoutIds) {
                clearTimeout(id);
              }
              flusher.provider.unbindRequests(flusher);
              flusher = null;
              if (init) Kick.init();
            }

            return;
          }

          /* logToConsole(
            `Width ${Math.round(width)} height ${Math.round(height)}`
          ); */

          const oldWidth = flusher.props.parentWidth;
          flusher.props.parentWidth = Math.trunc(width) * 2;
          flusher.props.parentHeight = Math.trunc(height);

          flusher.container.style.setProperty(
            "--flusher-width",
            `-${flusher.props.parentWidth}px`
          );

          flusher.toggle.setAttribute("domain", flusher.props.domain);

          const newFlushState =
            flusher.states.flushState !== undefined
              ? flusher.states.flushState
                ? "horizontal"
                : "vertical"
              : flusher.states.flushState
                ? "horizontal"
                : "vertical";

          flusher.container.setAttribute("layout", newFlushState);

          flusher.container.setAttribute("enabled", flusher.states.chatEnabled);

          flusher.container.setAttribute("shadow", flusher.states.shadow);

          flusher.container.setAttribute(
            "background",
            flusher.states.backgroundStates[flusher.states.backgroundState]
          );

          setAttribute(
            flusher.container,
            "font",
            flusher.states.sizeStates,
            flusher.states.fontState
          );

          flusher.container.setAttribute("time", flusher.states.timeState);

          if (flusher.props.isAeroKick) {
            flusher.container.setAttribute("aerokick", "");
          }

          toggleEnableMenu();

          setCustomPosition(flusher);

          const documentWidth = document.documentElement.clientWidth;
          if (documentWidth < flusher.props.parentWidth / 2 + 10) {
            flusher.props.isFullscreen = true;
            startScrollingInterval(flusher);
            flusher.props.videoSize = "fullscreen";
          } else {
            flusher.props.isFullscreen = false;
            stopScrollingInterval(flusher);
            if (document.querySelector('.sidebar')) {
              flusher.props.videoSize = "default";
            } else {
              flusher.props.videoSize = "theater";
            }
          }

          chrome.storage.local.get("positionsPerChannel", function (result) {
            var positionsPerChannel = result.positionsPerChannel || {};
            var positionsArray = positionsPerChannel[flusher.props.channelName] || [];

            var existingPositionIndex = positionsArray.findIndex(function (item) {
              return item.videoSize === flusher.props.videoSize;
            });

            if (existingPositionIndex !== -1) {
              const position = positionsArray[existingPositionIndex].position;
              if (position.top) {
                flusher.container.removeAttribute("position");
                var scaleFactor = window.innerWidth / window.outerWidth;
                flusher.container.style.top = position.top > height ? height - 20 + "px" : Math.round(position.top * scaleFactor) + "px";
                flusher.container.style.left = position.left > width ? width - 20 + "px" : Math.round(position.left * scaleFactor) + "px";
              } else {
                flusher.container.style.top = "";
                flusher.container.style.left = "";
                flusher.container.style.alignItems = "";
                setAttribute(
                  flusher.container,
                  "position",
                  flusher.states.positionStates,
                  flusher.states.positionState
                );
              } if (position.width) {
                flusher.container.removeAttribute("size");
                flusher.container.style.width = Math.round(position.width * scaleFactor) + "px";
                flusher.container.style.height = Math.round(position.height * scaleFactor) + "px";
              } else {
                flusher.container.style.width = "";
                flusher.container.style.height = "";
                setAttribute(
                  flusher.container,
                  "size",
                  flusher.states.sizeStates,
                  flusher.states.sizeState
                );
              }
            } else {
              flusher.container.style.top = "";
              flusher.container.style.left = "";
              flusher.container.style.alignItems = "";
              flusher.container.style.width = "";
              flusher.container.style.height = "";
              setAttribute(
                flusher.container,
                "position",
                flusher.states.positionStates,
                flusher.states.positionState
              );
              setAttribute(
                flusher.container,
                "size",
                flusher.states.sizeStates,
                flusher.states.sizeState
              );
            }
          });

          flusher.props.elementHeight = null;
          flusher.container.style.display = "flex";
          createIntroMessage(flusher);

          if (oldWidth == null || oldWidth == 0) {
            if (flusher.container === null) return;
            if (flusher.states.chatEnabled)
              flusher.provider.bindRequests(flusher);

            flusher.props.loading = false;
            processMessageQueue(flusher);
            togglePointerEvents(flusher);

            checkAddons(flusher);

            /* temp fix toggle btn not clickable in theater */
            const element = document.querySelector(".z\\-\\[500\\].flex.w-screen");
            if (element) element.classList.remove("z-[500]");

            logToConsole(
              `(${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? "VOD" : "LIVE"
              }): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`
            );
          } else {
            flusher.states.flushState
              ? flusher.clear()
              : null;
          }
        }
      }, 750);
    }
  });

  flusher.resizeObserver.observe(flusher.video);

  function checkAddons(flusher) {
    let counter = 0;

    const intervalId = setInterval(() => {
      const KickTools = document.querySelector('.vjs-progress-control')?.style?.display == 'flex' ? true : false;
      if (KickTools) {
        logToConsole(`KickTools Detected`);
        flusher.props.isKickTools = true;
        clearInterval(intervalId);
      }

      counter++;

      if (counter >= 5) {
        clearInterval(intervalId);
      }
    }, 1000)
    flusher.props.timeoutIds.push(intervalId);
  }

  function createIntroMessage(flusher) {
    const introContent = document.createElement("div");
    introContent.classList.add("flusher-message");

    const emojiSpan = document.createElement("span");
    emojiSpan.textContent = String.fromCodePoint(0x1f389) + " ";

    const introSpan = document.createElement("span");
    introSpan.textContent = `thanks for testing (version..)`;
    const introMessageSpan = document.createElement("span");

    introMessageSpan.append(emojiSpan, introSpan);

    introContent.appendChild(introMessageSpan);
    introContent.style.setProperty("--row", 0);
    introContent.classList.add("flusher-message");

    const parent = flusher.props.external ? flusher.container : document.body;
    parent.append(introContent);
    flusher.props.elementHeight = introContent.clientHeight;
    flusher.props.maxRows = Math.ceil(
      flusher.props.parentHeight / flusher.props.elementHeight
    );
    parent.removeChild(introContent);
    flusher.setVerticalWidth();
  }
}

function startScrollingInterval(flusher) {
  if (flusher.props.scrollIntervalId) return;
  scrollChat(flusher);
  flusher.props.scrollIntervalId = setInterval(function () {
    scrollChat(flusher);
  }, 10000);
}

function setAttribute(element, attribute, states, stateKey) {
  const state = states[stateKey];
  const value = state.replace(/\s/g, "");
  element.setAttribute(attribute, value);
}

export function stopScrollingInterval(flusher) {
  if (!flusher.props.scrollIntervalId) return;
  clearInterval(flusher.props.scrollIntervalId);
  flusher.props.scrollIntervalId = null;
}

function scrollChat(flusher) {
  const chatBtn = document.querySelector("#chatroom .justify-center.absolute");
  const chatContainer = document.querySelector("#chatroom [data-chat-entry]");
  if (flusher.props.isFullscreen && !flusher.props.isVod) {
    if (chatBtn !== null) {
      chatBtn.click();
    }
    if (chatContainer !== null) {
      const chatContainerParent = chatContainer.closest(".overflow-y-scroll");
      if (chatContainerParent !== null) {
        chatContainerParent.scrollTop = chatContainerParent.scrollHeight;
      }
    }
  }
}
