import { CellPosition, CellState } from './simulation';
import { createMenu } from './menu';
import { Signal } from './signal';

class QueensUI {
  public readonly onCellClicked = new Signal<[position: CellPosition]>();

  private readonly bottomText: HTMLParagraphElement;
  private readonly topText: HTMLParagraphElement;
  private readonly bottom: HTMLDivElement;
  private readonly top: HTMLDivElement;

  private readonly gridContainer: HTMLParagraphElement;
  private readonly grid: HTMLDivElement;

  private readonly cells: HTMLDivElement[][] = [];
  public readonly element: HTMLDivElement;
  private readonly _size: [number, number];

  get size() {
    return this._size;
  }

  constructor(size: [number, number]) {
    this._size = size;

    this.element = document.createElement('div');
    this.element.classList.add('game');

    this.topText = document.createElement('p');
    this.topText.classList.add('game-text');

    this.bottomText = document.createElement('p');
    this.bottomText.classList.add('game-text');

    this.top = document.createElement('div');
    this.top.classList.add('game-top');

    this.bottom = document.createElement('div');
    this.bottom.classList.add('game-bottom');

    this.gridContainer = document.createElement('div');
    this.gridContainer.classList.add('grid-container');

    this.grid = document.createElement('div');
    this.grid.classList.add('grid');

    this.gridContainer.appendChild(this.grid);

    this.top.appendChild(this.topText);
    this.bottom.appendChild(this.bottomText);

    this.element.appendChild(this.top);
    this.element.appendChild(this.gridContainer);
    this.element.appendChild(this.bottom);
  }

  public init() {
    for (let y = 0; y < this.size[1]; y++) {
      const row = document.createElement('div');
      row.classList.add('row');

      this.cells.push([]);
      for (let x = 0; x < this.size[0]; x++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'clear');

        const position: CellPosition = [y, x];
        cell.addEventListener('click', () => {
          if (!cell.classList.contains('active')) return;
          this.onCellClicked.send(position);
        });

        this.cells[y].push(cell);
        row.appendChild(cell);
      }

      this.grid.appendChild(row);
    }

    const recalculateCellSize = () => {
      this.grid.style.height = `0px`;
      this.grid.style.width = `0px`;

      const rect = this.gridContainer.getBoundingClientRect();
      let cellSize = (rect.height - this.size[1] - 1) / this.size[1];

      if (this.size[0] + 1 + cellSize * this.size[0] > rect.width) cellSize = (rect.width - this.size[0] - 1) / this.size[0];

      document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);

      this.grid.style.height = `${cellSize * this.size[1] + this.size[1] + 1}px`;
      this.grid.style.width = `${cellSize * this.size[0] + this.size[0] + 1}px`;
    };

    window.addEventListener('resize', recalculateCellSize);
    requestAnimationFrame(recalculateCellSize);
  }

  public deactivateAllCells() {
    for (const row of this.cells) {
      for (const cell of row) {
        cell.classList.remove('active', 'highlighted');
      }
    }
  }

  public setCellState(position: CellPosition, state: CellState) {
    const cell = this.cells[position[0]][position[1]];
    cell.classList.remove('clear', 'queen1', 'queen2', 'forbidden');
    // prettier-ignore
    cell.classList.add(
        state == CellState.Clear ? 'clear'
      : state == CellState.Queen1 ? 'queen1'
      : state == CellState.Queen2 ? 'queen2'
      : 'forbidden'
    );
  }

  public activateCell(position: CellPosition) {
    this.cells[position[0]][position[1]].classList.add('active');
  }

  public setTopText(text: string, color: string = 'white') {
    this.topText.textContent = text;
    this.topText.style.color = color;
  }

  public setBottomText(text: string, color: string = 'white') {
    this.bottomText.textContent = text;
    this.bottomText.style.color = color;
  }

  public showEndControls() {
    this.bottomText.remove();

    const menuButton = document.createElement('div');
    menuButton.textContent = 'Back To Menu';
    menuButton.classList.add('game-button');

    menuButton.addEventListener('click', () => {
      this.element.remove();
      const menu = createMenu();
      document.body.appendChild(menu);
    });

    this.bottom.appendChild(menuButton);
  }
}

export { QueensUI };
