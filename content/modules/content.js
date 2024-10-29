import Kick from './site/kick.js';
import Ip2 from './site/ip2.js';

window.location.hostname.includes('kick.com') ? Kick.init() : Ip2.init();