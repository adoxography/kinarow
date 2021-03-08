import 'alpinejs';
import 'regenerator-runtime/runtime';

import Agent from './agent';
import Board from './board';

const flash = message => window.dispatchEvent(new CustomEvent('flash', {
  detail: { message, time: 2000 }
}));

const fireStartGame = (agents, timePerMove) => window.dispatchEvent(new CustomEvent('startgame', {
  detail: { agents, timePerMove }
}));

const fireGameOver = () => window.dispatchEvent(new CustomEvent('gameover'));

const fireUpdateGame = detail => window.dispatchEvent(new CustomEvent('updategame', {
  detail
}));

const State = {
  SETUP: 'SETUP',
  PLAY: 'PLAY',
  WAIT: 'WAIT'
};

const Winner = {
  PLAYER_1: 'PLAYER_1',
  PLAYER_2: 'PLAYER_2',
  DRAW: 'DRAW'
};

const MESSAGES = {
  [Winner.PLAYER_1]: 'Player 1 wins!',
  [Winner.PLAYER_2]: 'Player 2 wins!',
  [Winner.DRAW]: 'It\'s a draw!'
};

window.State = State;
window.Winner = Winner;

/**
 * Date for control component
 */
window.Control = () => ({
  state: State.SETUP,
  width: 3,
  height: 3,
  k: 3,
  agents: [Agent(), Agent()],
  timePerMove: 5,
  showMoreSettings: false,

  async start() {
    this.state = State.WAIT;

    try {
      await Promise.all(this.agents.map(agent => agent.connect({
        width: this.width,
        height: this.height,
        k: this.k,
        timePerMove: this.timePerMove
      })));
      this.state = State.PLAY;
      fireStartGame(this.agents, this.timePerMove);
    } catch (e) {
      flash(e.message);
      this.agents.map(agent => agent.reset());
      this.state = State.SETUP;
    }
  },

  appear() {
    this.showMoreSettings = this.agents.some(agent => !agent.isHuman());
    this.state = State.SETUP;
  },

  update() {
    this.width = Math.max(3, this.width);
    this.height = Math.max(3, this.height);
    this.k = Math.max(3, Math.min(this.k, Math.max(this.width, this.height)));

    fireUpdateGame({
      width: this.width,
      height: this.height,
      k: this.k
    });
  },

  validateTimePerMove() {
    this.timePerMove = Math.max(1, this.timePerMove);
  }
});

/**
 * Data for game component
 */
window.Game = () => ({
  state: State.SETUP,
  board: Board(3, 3),
  k: 3,
  agents: [],
  timePerMove: 0,
  turn: 0,

  update(width, height, k) {
    this.board.width = width;
    this.board.height = height;
    this.k = k;
  },

  start(agents, timePerMove) {
    this.agents = agents;
    this.timePerMove = timePerMove;
    this.board.reset();
    this.turn = 0;
    this.getMove();
  },

  end() {
    fireGameOver();
    this.state = State.SETUP;
  },

  async getMove() {
    const agent = this.agents[this.turn];

    if (agent.isHuman()) {
      this.state = State.PLAY;
    } else {
      this.state = State.WAIT;

      const now = Date.now();
      const moveTime = now + 500;
      const timeoutTime = now + this.timePerMove * 1000;

      const timeoutCall = setTimeout(() => {
        flash(`${this.turn === 0 ? 'Player 1' : 'Player 2'} ran out of time. ${this.turn === 0 ? 'Player 2' : 'Player 1'} wins!`);
        this.end();
      }, this.timePerMove * 1000);

      const move = await agent.getMove({
        width: this.board.width,
        height: this.board.height,
        cells: this.board.cells,
        k: this.k,
        turn: this.turn,
        timePerMove: this.timePerMove
      });

      // Artificially insert a time delay if the move comes back
      // immediately so the bot feels like a person
      if (Date.now() < timeoutTime) {
        clearTimeout(timeoutCall);
        setTimeout(() => {
          this.makeMove(+move);
        }, moveTime - Date.now());
      }
    }
  },

  handleCellClicked(index) {
    if (this.state === State.PLAY && this.board.getCell(index) === null) {
      this.makeMove(index);
    }
  },

  makeMove(cellIndex) {
    // Lose immediately if the move is illegal
    if (cellIndex < 0 || cellIndex >= this.board.length || this.board.getCell(cellIndex) !== null) {
      this.state = State.SETUP;
      flash(`${this.turn === 0 ? 'Player 1' : 'Player 2'} made an illegal move; ${this.turn === 0 ? 'Player 2' : 'Player 1'} wins!`);
      return;
    }

    this.pulse(cellIndex);
    this.board.setCell(cellIndex, this.turn);
    this.turn = (this.turn + 1) % 2;
    const winner = this.getWinner();

    if (winner === null) {
      this.getMove();
    } else {
      flash(MESSAGES[winner]);
      this.state = State.WAIT;

      setTimeout(() => this.end(), 1000);
    }
  },

  getWinner() {
    const lines = this.board.lines();

    for (const line of lines) {
      for (let x = 0; x < line.length - this.k + 1; x += 1) {
        const slice = line.slice(x, x + this.k);

        const unique = slice.filter((v, i, s) => s.indexOf(v) === i);
        if (unique.length === 1 && unique[0] !== null) {
          return unique[0] === 0 ? Winner.PLAYER_1 : Winner.PLAYER_2;
        }
      }
    }

    if (this.board.cells.every(cell => cell !== null)) {
      return Winner.DRAW;
    }

    return null;
  },

  reset() {
    this.board.reset();
    this.turn = 0;

    for (const agent of this.agents) {
      agent.ready = false;
    }
  },

  pulse(cellIndex) {
    const cell = this.$refs[`cell-${cellIndex}`];
    cell.classList.add('pulse');
    setTimeout(() => cell.classList.remove('pulse'), 400);
  }
});
