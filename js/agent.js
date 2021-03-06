const Agent = (url = '') => ({
  url,
  ready: false,

  setUrl(newUrl) {
    this.url = newUrl;
    this.ready = false;
  },

  isHuman() {
    return this.url === '';
  },

  reset() {
    this.ready = false;
  },

  get cleanUrl() {
    return this.url.replace(/\/$/, '');
  },

  async connect() {
    if (!this.isHuman()) {
      try {
        const response = await fetch(`${this.cleanUrl}/status`);
        if (response.status !== 200) {
          throw new Error('Bad status');
        }
      } catch (e) {
        throw new Error(`Could not connect to ${this.url}`);
      }
    }

    this.ready = true;
  },

  async getMove(params) {
    const response = await fetch(`${this.cleanUrl}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    const text = await response.text();
    return text;
  }
});

export default Agent;
