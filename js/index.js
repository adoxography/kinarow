import 'alpinejs';
import 'regenerator-runtime/runtime';

import { PLAYER_1, PLAYER_2, SETUP, PLAY, WAIT } from './constants';
import Control from './control';
import Game from './game';

// Attach structures Alpine will need to the window
window.PLAYER_1 = PLAYER_1;
window.PLAYER_2 = PLAYER_2;
window.SETUP = SETUP;
window.PLAY = PLAY;
window.WAIT = WAIT;
window.Control = Control;
window.Game = Game;
