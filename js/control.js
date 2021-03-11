import Agent from './agent';
import { SETUP, PLAY, WAIT } from './constants';
import { fireStartGame, fireUpdateGame, flash } from './events';

/**
 * Data for the Alpine control component
 */
const Control = () => ({
  state: SETUP,
  width: 3,
  height: 3,
  k: 3,
  agents: [Agent(), Agent()],
  timePerMove: 5,
  showBotSettings: false,

  /**
   * Starts the game
   */
  async start() {
    this.state = WAIT;

    try {
      await Promise.all(this.agents.map(agent => agent.connect({
        width: this.width,
        height: this.height,
        k: this.k,
        timePerMove: this.timePerMove
      })));
      this.state = PLAY;
      fireStartGame(this.agents, this.timePerMove);
    } catch (e) {
      flash(e.message);
      this.agents.map(agent => agent.reset());
      this.state = SETUP;
    }
  },

  /**
   * Displays the control panel and resets it
   */
  appear() {
    this.showBotSettings = this.agents.some(agent => !agent.isHuman());
    this.state = SETUP;
  },

  /**
   * Updates the settings and fires an event to alert other components of the
   * new settings
   */
  update() {
    // Validate the settings
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

export default Control;
