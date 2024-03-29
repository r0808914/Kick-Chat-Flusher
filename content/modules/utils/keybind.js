export class KeybindListener {
   constructor(flusher) {
      this.flusher = flusher;
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.modifierKeys = { alt: false, control: false, shift: false };
      this.nonModifierKey = null;
      this.startListening();
   }

   startListening() {
      window.addEventListener('keydown', this.handleKeyDown);
   }

   stopListening() {
      window.removeEventListener('keydown', this.handleKeyDown);
   }

   handleKeyDown(event) {
      if (this.flusher.props.isCaptureKeybind) return;
      if (event.key.length === 1) {
         this.nonModifierKey = event.key.toUpperCase();
      } else if (event.key === 'Alt' || event.key === 'Control' || event.key === 'Shift') {
         this.modifierKeys[event.key.toLowerCase()] = true;
      }

      if (this.nonModifierKey) {
         for (const action in this.flusher.states.keybinds) {
            if (this.flusher.states.keybinds.hasOwnProperty(action)) {
               const keyCombination = this.flusher.states.keybinds[action];
               const keys = keyCombination.split(' + ');

               let modifierKeysMatch = true;
               if ((keys.includes('ALT') && !this.modifierKeys.alt) ||
                  (keys.includes('CTRL') && !this.modifierKeys.control) ||
                  (keys.includes('SHIFT') && !this.modifierKeys.shift)) {
                  modifierKeysMatch = false;
               }

               const nonModifierKeyMatch = this.nonModifierKey === keys[keys.length - 1].toUpperCase();

               if (modifierKeysMatch && nonModifierKeyMatch) {
                  const mouseDownEvent = new MouseEvent('mousedown', {
                     bubbles: true,
                     cancelable: true,
                     button: 0,
                     buttons: 1,
                  });

                  switch (action) {
                     case "overlay":
                        const flusherToggle = this.flusher.menu.querySelector('.flusher-enable .flusher-toggle');
                        flusherToggle.dispatchEvent(mouseDownEvent);
                        break;
                     case "flush":
                        const flushToggle = this.flusher.menu.querySelector('.flusher-flush .flusher-toggle');
                        flushToggle.dispatchEvent(mouseDownEvent);
                        break;
                     case "spam":
                        const spamToggle = this.flusher.menu.querySelector('.flusher-spam .flusher-toggle');
                        spamToggle.dispatchEvent(mouseDownEvent);
                        break;
                     case "menu":
                        const menuToggle = document.querySelector('.flusher-toggle');
                        menuToggle.dispatchEvent(mouseDownEvent);
                        this.flusher.menu.focus();
                        break;

                     default:
                        break;
                  }
                  break;
               }
            }
         }

         this.modifierKeys = { alt: false, control: false, shift: false };
         this.nonModifierKey = null;
      }
   }
}
