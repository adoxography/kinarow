class ConnectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConnectionError';
  }
}

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

  async connect(params) {
    // Build query string
    const queryString = Object.keys(params)
                              .filter(key => params.hasOwnProperty(key))
                              .map(key => `${key}=${params[key]}`)
                              .join('&');

    if (!this.isHuman()) {
      try {
        const response = await fetch(`${this.cleanUrl}/status?${queryString}`);

        if (response.status === 418) {
          throw new ConnectionError(`${this.url} does not support those parameters.`);
        } else if (response.status !== 200) {
          throw new ConnectionError(`Could not connect to ${this.url}`);
        }
      } catch (e) {
        if (e.name === 'ConnectionError') {
          throw e;
        } else {
          throw new Error(`Could not connect to ${this.url}`);
        }
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
