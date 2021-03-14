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

const GAME_OVER_MESSAGES = {
  [PLAYER_1]: 'Player 1 wins!',
  [PLAYER_2]: 'Player 2 wins!',
  [DRAW]: 'It\'s a draw!'
};

/**
 * Data for the Alpine game component
 */
const Game = () => ({
  state: SETUP,
  board: Board(3, 3),
  k: 3,
  agents: [],
  timePerMove: 0,
  turn: 0,
  thinking: false,

  /**
   * Updates the internal settings of the game. Does nothing if the game is not
   * in setup mode.
   *
   * @param width   The new width
   * @param height  The new height
   * @param k       The number of cells in a row needed to win
   */
  update(width, height, k) {
    if (this.state === SETUP) {
      this.board.width = width;
      this.board.height = height;
      this.k = k;
    }
  },

  /**
   * Starts the game
   *
   * @param agents       An array of two Agent objects
   * @param timePerMove  The amount of time a bot agent has to move
   *
   * @see js/agent.js
   */
  start(agents, timePerMove) {
    this.agents = agents;
    this.timePerMove = timePerMove;

    this.board.reset();
    this.turn = 0;

    this.getMove();
  },

  /**
   * Ends the game
   */
  end() {
    fireGameOver();
    this.state = SETUP;
  },

  /**
   * Gets a move from an agent
   *
   * If the agent is human, the game is put into the play state. If the agent
   * is a bot, the game is put into the wait state while it gets a move from
   * the bot.
   */
  getMove() {
    const agent = this.agents[this.turn];

    if (agent.isHuman()) {
      this.state = PLAY;
    } else {
      this.state = WAIT;
      this.getBotMove(agent);
    }
  },

  /**
   * Gets a move from a bot agent
   *
   * @param agent  The bot agent
   */
  async getBotMove(agent) {
    const now = Date.now();
    const moveTime = now + 500;
    const timeoutTime = now + this.timePerMove * 1000;
    this.thinking = true;

    // Set up a timout function that will execute if the bot's move doesn't
    // come back in time.
    const timeoutCall = setTimeout(() => {
      this.thinking = false;
      flash(`${this.turn === PLAYER_1 ? 'Player 1' : 'Player 2'} ran out of time. ${this.turn === PLAYER_1 ? 'Player 2' : 'Player 1'} wins!`);
      this.end();
    }, this.timePerMove * 1000);

    try {
      const move = await agent.getMove({
        width: this.board.width,
        height: this.board.height,
        cells: this.board.cells,
        k: this.k,
        turn: this.turn,
        timePerMove: this.timePerMove
      });

      if (Date.now() < timeoutTime) {
        // We got a move - no need to time the game out anymore.
        clearTimeout(timeoutCall);

        // Artificially insert a time delay if the move comes back immediately so
        // the bot feels like a person
        setTimeout(() => {
          this.thinking = false;
          this.makeMove(+move);
        }, moveTime - Date.now());
      }
    } catch (e) {
      clearTimeout(timeoutCall);
      this.end();
      flash(`There was an error getting a move from ${this.turn === PLAYER_1 ? 'Player 1' : 'Player 2'}`);
    }
  },

  /**
   * Handles a human clicking on a cell.
   *
   * @param index  The index of the cell
   */
  handleCellClicked(index) {
    if (this.state === PLAY && this.board.getCell(index) === null) {
      this.makeMove(index);
    }
  },

  /**
   * Makes a move in the game and passes control off to the next action (game
   * over or the next player's turn)
   *
   * If the move is illegal, the current player immediately loses the game.
   */
  makeMove(cellIndex) {
    // Lose immediately if the move is illegal
    if (cellIndex < 0 || cellIndex >= this.board.length || this.board.getCell(cellIndex) !== null) {
      this.end();
      flash(`${this.turn === PLAYER_1 ? 'Player 1' : 'Player 2'} made an illegal move; ${this.turn === PLAYER_1 ? 'Player 2' : 'Player 1'} wins!`);
      return;
    }

    this.pulse(cellIndex);
    this.board.setCell(cellIndex, this.turn);
    this.turn = (this.turn + 1) % 2;
    const winner = this.getWinner();

    if (winner === null) {
      // If the game isn't over yet, get the next move
      this.getMove();
    } else {
      // If the game is over, display the winner information
      flash(GAME_OVER_MESSAGES[winner]);
      this.state = WAIT;

      // Wait a second before going back to setup mode so the player(s) can see
      // the final state of the board.
      setTimeout(() => this.end(), 1000);
    }
  },

  /**
   * Finds the winner of the game
   *
   * @return PLAYER_1 if player 1 won, PLAYER_2 if player 2 won, DRAW if the
   * cells are all filled but no player won, or null if the game is not over.
   */
  getWinner() {
    const lines = this.board.lines();

    for (const line of lines) {
      for (let x = 0; x < line.length - this.k + 1; x += 1) {
        const slice = line.slice(x, x + this.k);

        const unique = slice.filter((v, i, s) => s.indexOf(v) === i);
        if (unique.length === 1 && unique[0] !== null) {
          return unique[0];
        }
      }
    }

    if (this.board.cells.every(cell => cell !== null)) {
      return DRAW;
    }

    return null;
  },

  /**
   * Makes a cell pulse
   *
   * Used to highlight a move
   */
  pulse(cellIndex) {
    const cell = this.$refs[`cell-${cellIndex}`];
    cell.classList.add('pulse');
    setTimeout(() => cell.classList.remove('pulse'), 400);
  }
});

export default Game;
