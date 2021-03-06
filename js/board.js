import { range, rangeRight } from 'lodash';

const generateLineIndices = (width, height) => {
  const min = Math.min(width, height);
  const hExtra = Math.min(0, height - width);
  const wExtra = Math.min(0, width - height);

  return [
    // Rows
    ...range(height).map(y => range(width).map(x => y * width + x)),

    // Columns
    ...range(width).map(x => range(height).map(y => y * width + x)),

    // TL to BR diagonals starting in the top row
    ...range(width)
      .map(xOffset => range(min - Math.max(0, xOffset + hExtra))
        .map(y => xOffset + (y * (width + 1)))),

    // TR to BL diagonals starting in the top row
    ...rangeRight(width)
      .map((xOffset, i) => range(min - Math.max(0, i + hExtra))
        .map(y => xOffset + (y * (width - 1)))),

    // TL to BR diagonals starting in the left column
    ...range(1, height)
      .map(yOffset => range(min - Math.max(-1, yOffset + wExtra))
        .map(x => yOffset * width + x * (width + 1))),

    // TR to BL diagonals starting in the right column
    ...range(1, height)
      .map(yOffset => range(min - Math.max(-1, yOffset + wExtra))
        .map(x => (yOffset + 1) * width - 1 + x * (width - 1)))
  ];
};

const Board = (width, height) => ({
  width,
  height,
  cells: new Array(width * height).fill(null),
  lineIndices: generateLineIndices(width, height),

  get length() {
    return this.cells.length;
  },

  lines() {
    return this.lineIndices.map(line => line.map(index => this.getCell(index)));
  },

  reset() {
    this.cells = new Array(this.width * this.height).fill(null);
    this.lineIndices = generateLineIndices(this.width, this.height);
  },

  getCellIndex(x, y) {
    return y * this.width + x;
  },

  getCell(x, y) {
    if (y === undefined) {
      return this.cells[x];
    }
    return this.cells[this.getCellIndex(x, y)];
  },

  setCell(x, y, value) {
    if (value === undefined) {
      this.cells[x] = y;
      return;
    }
    this.cells[this.getCellIndex(x, y)] = value;
  }
});

export default Board;
