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
      if (['alt', 'control', 'shift'].includes(key)) {
         this.modifierKeys[key] = true;
      } else if (this.anyModifierKeyPressed()) {
         this.nonModifierKey = event.key.toUpperCase();
      }
      this.processKey();
   }

   handleKeyUp(event) {
      const key = event.key.toLowerCase();
      if (['alt', 'control', 'shift'].includes(key)) {
         this.modifierKeys[key] = false;
      }
      if (!this.anyModifierKeyPressed()) {
         this.nonModifierKey = null;
      }
   }

   anyModifierKeyPressed() {
      return Object.values(this.modifierKeys).some(modifier => modifier === true);
   }

   processKey() {
      if (!this.nonModifierKey) return;

      for (const action in this.flusher.states.keybinds) {
         if (this.flusher.states.keybinds.hasOwnProperty(action)) {
            const keyCombination = this.flusher.states.keybinds[action];
            const keys = keyCombination.split(' + ');

            const modifierKeysMatch = (keys.includes('ALT') === this.modifierKeys.alt) &&
               (keys.includes('CTRL') === this.modifierKeys.control) &&
               (keys.includes('SHIFT') === this.modifierKeys.shift);

            const nonModifierKeyMatch = this.nonModifierKey === keys[keys.length - 1].toUpperCase();

            if (modifierKeysMatch && nonModifierKeyMatch) {
               this.activateAction(action);
               break;
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

      const selectorMap = {
         overlay: '.flusher-enable .flusher-toggle',
         flush: '.flusher-flush .flusher-toggle',
         spam: '.flusher-spam .flusher-toggle',
         menu: '.flusher-toggle'
      };

      const element = (action === 'menu' ? document : this.flusher.menu).querySelector(selectorMap[action]);
      if (element) {
         element.dispatchEvent(mouseDownEvent);
         if (action === 'menu') this.flusher.menu.focus();
      }
   }
}
