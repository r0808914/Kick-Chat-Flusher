import Kick from './site/kick.js';

console.log('\x1b[42m\x1b[97m Kick Chat Flusher \x1b[49m\x1b[0m Initialize');
window.location.hostname.includes('kick.com') ? Kick.init() : ip2();