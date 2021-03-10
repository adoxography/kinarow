import 'alpinejs';
import 'regenerator-runtime/runtime';

import { SETUP, PLAY, WAIT } from './constants';
import Control from './control';
import Game from './game';

// Attach structures Alpine will need to the window
window.SETUP = SETUP;
window.PLAY = PLAY;
window.WAIT = WAIT;
window.Control = Control;
window.Game = Game;
