# K-in-a-Row
This is an implementation of an [m, n, k-game](https://en.wikipedia.org/wiki/M,n,k-game) that exposes an interface for user-created bot players.

## Creating a bot player
A bot needs to exist as a publicly available web server that responds to two routes, `/status` and `/move`. An example bot built on [REPL.it](https://repl.it) using node/express can be found [here](https://repl.it/@adoxography/KIRA).

### `GET /status`
Accessed just before the game begins, to verify that the bot is online. Must return a `200` status code.

### `POST /move`
Accessed whenever the bot needs to make a move. Receives the following json-encoded parameters in its body:

- `width` (Number): The number of columns in the board
- `height` (Number): The number of rows in the board
- `cells` (Array): A flat array of size `width`×`height`, which are the rows of the grid concatenated together. `null` indicates that a cell is empty; `0` indicates that a cel is occupied by player 1, and `1` indicates that a cell is occupied by player 2.
- `k` (Number): The number of cells in a row (in any direction) needed to win
- `turn` (Number): If `0`, it is currently player 1's turn. `1` indicates that it is player 2's turn.

The route must respond with the 0-based index of the cell it wishes to move to. Note that if the bot responds with an invalid move, it will immediately lose the game.

#### Example

Given the following game state:
```ruby
0 _ 0 0
1 0 1 _
_ 1 _ 1
```

The parameters sent to `/move` would be:

```json
{
  "width": 4,
  "height": 3,
  "cells": [0, null, 0, 0, 1, 0, 1, null, null, 1, null, 1],
  "k": 3,
  "turn": 0
}
```

An acceptable response might be

```ruby
7
```

## Running the app locally

1. Ensure that `node`, `npm`, and `yarn` are installed.

2. Clone the repo

```bash
git clone https://github.com/adoxography/kinarow
```

3. Install the dependencies

```bash
yarn install
```

4. Start the development server

```bash
yarn start
```

## License
[MIT](/LICENSE)
