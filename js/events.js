export const fireGameOver = () => window.dispatchEvent(new CustomEvent('gameover'));

export const flash = message => window.dispatchEvent(new CustomEvent('flash', {
  detail: { message, time: 2000 }
}));

export const fireStartGame = (agents, timePerMove) => window.dispatchEvent(new CustomEvent('startgame', {
  detail: { agents, timePerMove }
}));

export const fireUpdateGame = detail => window.dispatchEvent(new CustomEvent('updategame', {
  detail
}));
