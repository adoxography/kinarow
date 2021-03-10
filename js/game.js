import Board from './board';
import {
  SETUP,
  PLAY,
  WAIT,
  PLAYER_1,
  PLAYER_2,
  DRAW
} from './constants';
import { fireGameOver, flash } from './events';

const MESSAGES = {
  [PLAYER_1]: 'Player 1 wins!',
  [PLAYER_2]: 'Player 2 wins!',
  [DRAW]: 'It\'s a draw!'
};

const Game = () => ({
  state: SETUP,
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
    this.state = SETUP;
  },

  async getMove() {
    const agent = this.agents[this.turn];

    if (agent.isHuman()) {
      this.state = PLAY;
    } else {
      this.state = WAIT;

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
    if (this.state === PLAY && this.board.getCell(index) === null) {
      this.makeMove(index);
    }
  },

  makeMove(cellIndex) {
    // Lose immediately if the move is illegal
    if (cellIndex < 0 || cellIndex >= this.board.length || this.board.getCell(cellIndex) !== null) {
      this.state = SETUP;
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
      this.state = WAIT;

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
          return unique[0] === 0 ? PLAYER_1 : PLAYER_2;
        }
      }
    }

    if (this.board.cells.every(cell => cell !== null)) {
      return DRAW;
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

export default Game;
