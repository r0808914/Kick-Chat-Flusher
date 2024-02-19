import Kick from './site/kick.js';
import Ip2 from './site/ip2.js';

window.location.hostname.includes('kick.com') ? setTimeout(Kick.init(), 2000) : Ip2.init();