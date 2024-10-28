import Kick from "../site/kick.js";
import { togglePointerEvents } from "../interface/menu/menu.js";
import { processMessageQueue } from "../queue/queue.js";
import { logToConsole } from "./utils.js";
import { KeybindListener } from "./keybind.js";
import { setCustomPosition } from "../interface/overlay.js";

export function reset(flusher) {
  const init = !flusher.props.external;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();
  flusher.resizeObserver = null;
  if (flusher.props.keydownListener) flusher.props.keydownListener.stopListening();

  for (const id of flusher.props.timeoutIds) {
    clearTimeout(id);
  }

  /* temp fix */
  const flusherElements = document.querySelectorAll('.flusher');

  flusherElements.forEach(element => {
    element.remove();
  });

  if (flusher.video) flusher.video.removeAttribute('flusher')
  /* - */

  flusher.provider.unbindRequests(flusher);
  flusher.clear();
  flusher = null;

  if (init) Kick.init();
}

export function checkResize(flusher) {
  const videoElement = flusher.video.querySelector("video");

  const target = (!flusher.props.isAeroKick && videoElement) ? videoElement : flusher.video;

  flusher.resizeTimer = null;
  if (flusher.resizeObserver) flusher.resizeObserver.disconnect();

  flusher.resizeObserver = new ResizeObserver((entries) => {
    if (flusher.resizeTimer) cancelAnimationFrame(flusher.resizeTimer);

    flusher.resizeTimer = requestAnimationFrame(() => {
      if (flusher.container !== null) flusher.container.style.display = "none";

      const rect = target.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      const isUrlEqual = (window.currentUrl === undefined || window.currentUrl === window.location.href);
      window.currentUrl = window.location.href;

      const videoChanged = flusher.props.isAeroKick ? checkAeroKick() : false;

      if (((width === null || width === 0) && (!height || height === 0) && !videoChanged) || !isUrlEqual || !flusher?.container) {
        reset(flusher);
        return;
      }

      if (flusher.props.isAeroKick) checkAeroKick();

      const oldWidth = flusher.props.parentWidth;
      flusher.props.parentWidth = Math.trunc(width) * 2;
      flusher.props.parentHeight = Math.trunc(height);
      flusher.props.parentRight = rect.right;

      setAttributes();
      setCustomPosition(flusher);
      detectViewMode();
      checkPosition(flusher, height, width);

      flusher.props.elementHeight = null;
      flusher.container.style.display = "flex";
      createIntroMessage(flusher);

      if (oldWidth == null || oldWidth === 0) {
        if (flusher.container === null) return;

        if (flusher.states.chatEnabled) flusher.provider.bindRequests(flusher);

        flusher.props.loading = false;
        processMessageQueue(flusher);
        togglePointerEvents(flusher);
        checkAddons(flusher);

        logToConsole(`(${flusher.props.channelName} ${flusher.props.domain} ${flusher.props.isVod ? "VOD" : "LIVE"}): Report bugs or collaborate at https://github.com/r0808914/Kick-Chat-Flusher`);

        flusher.props.keydownListener = new KeybindListener(flusher);
      } else {
        flusher.states.flushState ? flusher.clear() : null;
      }
    });
  });

  flusher.resizeObserver.observe(target);

  function checkAddons(flusher) {
    let counter = 0;

    const intervalId = setInterval(() => {
      const KickTools = document.querySelector('.vjs-progress-control')?.style?.display == 'flex' ? true : false;
      if (KickTools && !flusher.props.isKickTools) {
        logToConsole(`KickTools Detected`);
        flusher.props.isKickTools = true;
      }

      const AeroKick = document.body.classList.contains("aerokick-customization");
      if (AeroKick) {
        flusher.props.isAeroKick = true;
        /* logToConsole(`AeroKick Detected`); */
        checkAeroKick();
      }

      if (KickTools && AeroKick) clearInterval(intervalId);

      counter++;

      if (counter >= 5) {
        clearInterval(intervalId);
      }
    }, 1000)
    flusher.props.timeoutIds.push(intervalId);
  }

  function checkAeroKick() {
    /* if (flusher.props.isAeroKick) { */
    const videoHolder = flusher.video.closest('#video-holder');
    const bkVideoPlayer = document.getElementById('bk-video-player');

    const videoHolderWidth = videoHolder?.offsetWidth ?? 0;
    const bkVideoPlayerWidth = bkVideoPlayer?.offsetWidth ?? 0;

    flusher.toggle.setAttribute("AeroKick", "");

    let largestElement;

    if (videoHolderWidth > bkVideoPlayerWidth) {
      largestElement = videoHolder;
    } else if (videoHolderWidth < bkVideoPlayerWidth) {
      largestElement = bkVideoPlayer;
    }

    if (!largestElement) return false;

    if (largestElement !== target) {
      flusher.resizeObserver.disconnect();
      flusher.resizeObserver = null;

      const flusherElement = document.querySelector('.flusher');
      if (!flusherElement) return false;

      largestElement.appendChild(flusherElement);

      const shadowboxElement = document.querySelector('#shadowbox');
      if (shadowboxElement) largestElement.appendChild(shadowboxElement);

      flusher.video = largestElement;
      flusherElement.style.cssText = 'position: absolute !important; z-index: 1010;';

      flusher.menu.style.top = '0 !important';
      flusher.menu.style.right = '0 !important';

      shadowboxElement.style.zIndex = 1020;

      const toggle = flusher.toggle.querySelector('svg') ?? flusher.toggle;

      const existingButton = flusher.video.parentElement.querySelector('button.bk-relative.bk-mr-4');
      existingButton.parentElement.insertBefore(toggle, existingButton);

      checkResize(flusher, largestElement);
    }
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

  function setAttributes() {
    if (!flusher?.container) return;

    flusher.container.style.setProperty(
      "--flusher-width",
      `-${flusher.props.parentWidth}px`
    );

    if (flusher.toggle) flusher.toggle.setAttribute("domain", flusher.props.domain);

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
  }

  function detectViewMode() {
    const documentWidth = document.documentElement.clientWidth;
    if (documentWidth < flusher.props.parentWidth / 2 + 10) {
      flusher.props.videoSize = "fullscreen";
      startScrollingInterval(flusher);
    } else {
      stopScrollingInterval(flusher);
      const sidebar = document.querySelector('#sidebar-wrapper');
      if (sidebar && window.getComputedStyle(sidebar).display !== 'none') {
        flusher.props.videoSize = "default";
      } else {
        flusher.props.videoSize = "theater";
      }
    }
  }
}

function setAttribute(element, attribute, states, stateKey) {
  const state = states[stateKey];
  const value = state.replace(/\s/g, "");
  element.setAttribute(attribute, value);
}

function startScrollingInterval(flusher) {
  if (flusher.props.scrollIntervalId) return;
  scrollChat(flusher);
  flusher.props.scrollIntervalId = setInterval(function () {
    scrollChat(flusher);
  }, 10000);
}

export function stopScrollingInterval(flusher) {
  if (!flusher.props.scrollIntervalId) return;
  clearInterval(flusher.props.scrollIntervalId);
  flusher.props.scrollIntervalId = null;
}

export function checkPosition(flusher, height, width) {
  if (!height || !width) {
    const rect = flusher.video.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }
  if (flusher.states.flushState) {
    flusher.container.style.top = "";
    flusher.container.style.left = "";
    flusher.container.style.alignItems = "";
    flusher.container.style.width = "";
    flusher.container.style.height = "";
  } else {
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
          flusher.container.style.top = position.top > height ? height - 70 + "px" : Math.round(position.top * scaleFactor) + "px";
          flusher.container.style.left = position.left > width ? width - 70 + "px" : Math.round(position.left * scaleFactor) + "px";
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
  }
}

export async function scrollChat(flusher) {
  const buttons = document.querySelectorAll('button.bg-surface-base');

  const chatBtn = Array.from(buttons).find(
    (button) => button.innerText.trim() === "Chat paused for scrolling"
  );

  const chatContainer = document.querySelector('#chatroom-messages');

  let attempts = 0;
  const maxAttempts = 10;
  const interval = 500;

  if (chatContainer === null) return;

  while (attempts < maxAttempts) {
    if (chatBtn) chatBtn.click();

    chatContainer.scrollTop = chatContainer.scrollHeight;

    if (isScrolledToBottom(chatContainer)) break;

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  function isScrolledToBottom(chatContainer) {
    return chatContainer.scrollTop + chatContainer.clientHeight >= chatContainer.scrollHeight;
  }
}
