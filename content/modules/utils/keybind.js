export class KeybindListener {
   constructor(flusher) {
      this.flusher = flusher;
      this.handleKeyDown = this.handleKeyDown.bind(this);
      this.handleKeyUp = this.handleKeyUp.bind(this);
      this.modifierKeys = { alt: false, control: false, shift: false };
      this.nonModifierKey = null;
      this.startListening();
   }

   startListening() {
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);
   }

   stopListening() {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);
   }

   handleKeyDown(event) {
      if (this.flusher.props.isCaptureKeybind) return;
      const key = event.key?.toLowerCase();
      if (key === 'alt' || key === 'control' || key === 'shift') {
         this.modifierKeys[key] = true;
      } else if (this.anyModifierKeyPressed()) {
         this.nonModifierKey = event.key.toUpperCase();
      }
      this.processKey();
   }

   handleKeyUp(event) {
      if (event.key === 'Alt' || event.key === 'Control' || event.key === 'Shift') {
         this.modifierKeys[event.key.toLowerCase()] = false;
      }
      if (!this.anyModifierKeyPressed()) {
         this.nonModifierKey = null;
      }
   }

   anyModifierKeyPressed() {
      return Object.values(this.modifierKeys).some(modifier => modifier === true);
   }

   processKey() {
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
                  this.activateAction(action);
                  break;
               }
            }
         }
      }
   }

   activateAction(action) {
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
   }
}