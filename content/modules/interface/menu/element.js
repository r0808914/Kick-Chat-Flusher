const menuHtml = `<div class="flusher-menu" style="display: none;">
  <div class="flusher-menu-base" style="display: block;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <div class="flusher-menu-title">Chat Flusher</div>
      </div><button class="flusher-menu-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="flusher-icon icon"><svg width="12" height="12"
          viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="chat-actions-menu-list">
        <div class="flusher-enable flusher-actions-item">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="flusher-flush flusher-actions-item" style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Flush</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div class="flusher-toggle-size-sm">
              <div class="flusher-toggle">
                <div class="flusher-toggle-indicator"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="flusher-layoutMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
          style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Layout</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg></div>
          </div>
        </div>
        <div
          class="flusher-settings flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
          style="display: flex;">
          <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Settings</div>
          <div class="flex h-10 w-fit items-center justify-end">
            <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
              xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
            </svg></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-settings" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-settings-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Settings</div>
      </div>
      <button class="flusher-settings-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-spam flusher-actions-item">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Spam</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flusher-font flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Font Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div class="flusher-spaced flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Spaced</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-background flusher-actions-item" style="display: none;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flusher-store flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Web Store
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
            <path
              d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z"
              fill="currentColor"></path>
          </svg></div>
        </div>
      </div>
      <div
        class="flusher-home flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium">Report Bugs
        </div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg width="16" height="16" viewBox="0 0 16 16"
            fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.5 12.5V2H2V14H14V12.5H3.5Z" fill="currentColor"></path>
            <path
              d="M5.52869 11.5287L10.9999 6.06125V9.5H12.4999V3.5H6.49994V5H9.93869L4.47119 10.4712L5.52869 11.5287Z"
              fill="currentColor"></path>
          </svg></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-layout" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-layout-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Layout</div>
      </div>
      <button class="flusher-layout-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div
        class="flusher-messageMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
        style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Message</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
          </svg></div>
        </div>
      </div>
      <div
        class="flusher-overlayMenu flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60"
        style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Overlay</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div style="width: 16px; height: 16px;" class="flusher-icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m4.5 12.9l4.9-4.9-4.9-4.9 1.1-1.1 6 6-6 6z"></path>
          </svg></div>
        </div>
      </div>

    </div>
  </div>
  <div class="flusher-menu-message" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-message-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Message</div>
      </div>
      <button class="flusher-message-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div class="flusher-reply flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Reply</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-slide flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Slide</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-shadow flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Text Shadow</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="flusher-time flusher-actions-item" style="display: flex;">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Show Time</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="flusher-toggle-size-sm">
            <div class="flusher-toggle">
              <div class="flusher-toggle-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flusher-background flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Background</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="flusher-menu-overlay" style="display: none;">
    <div class="flex items-center justify-between px-2.5 pt-1 text-base font-bold">
      <div class="flex h-8 items-center space-x-2.5">
        <button class="flusher-overlay-back -ml-2 variant-text size-sm flusher-icon-button">
          <div style="width: 16px; height: 16px;" class="base-icon icon"><svg version="1.2"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path id="Layer" class="s0" d="m11.1 3.1l-4.9 4.9 4.9 4.9-1.1 1.1-6-6 6-6z"></path>
          </svg></div>
        </button>
        <div class="pr-3">Overlay</div>
      </div>
      <button class="flusher-overlay-close variant-text size-xs flusher-icon-button">
        <div style="width: 12px; height: 12px;" class="base-icon icon"><svg width="12" height="12" viewBox="0 0 12 13"
          fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 1.99602L10.504 0.5L6 4.99867L1.49602 0.5L0 1.99602L4.49867 6.5L0 11.004L1.49602 12.5L6 8.00133L10.504 12.5L12 11.004L7.50133 6.5L12 1.99602Z"
            fill="currentColor"></path>
        </svg></div>
      </button>
    </div>
    <div class="chat-actions-content">
      <div
        class="flusher-position flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Position</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
      <div
        class="flusher-size flusher-actions-item cursor-pointer hover:bg-secondary-lightest active:bg-secondary-lightest/60">
        <div class="select-none overflow-hidden truncate pr-2 text-sm font-medium">Size</div>
        <div class="flex h-10 w-fit items-center justify-end">
          <div class="select-none overflow-hidden truncate pr-0 text-sm font-medium"></div>
        </div>
      </div>
    </div>
  </div>
</div>`;

const parser = new DOMParser();
const doc = parser.parseFromString(menuHtml, 'text/html');
export const menu = doc.body.firstChild;