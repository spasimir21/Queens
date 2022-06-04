import { Signal } from './signal';

type CellPosition = [number, number];

enum CellState {
  Clear,
  Queen1,
  Queen2,
  Forbidden
}

enum GameState {
  Place,
  Win
}

enum Player {
  Player1,
  Player2
}

class QueensSimulation {
  public readonly onCellStateChange = new Signal<[position: CellPosition, state: CellState]>();
  public readonly onGameStateChange = new Signal<[state: GameState, player: Player]>();

  public readonly size: [number, number];
  private cells: CellState[][] = [];

  // prettier-ignore
  private _playableCells: CellPosition[] = [];
  private _currentPlayer: Player;
  private _state: GameState;

  get state() {
    return this._state;
  }

  get currentPlayer() {
    return this._currentPlayer;
  }

  get playableCells() {
    return this._playableCells;
  }

  constructor(size: [number, number]) {
    for (const len of size)
      if (!Number.isInteger(len) || len < 5 || len > 51)
        throw new Error("Queens's grid size must be a whole number and between 5 and 51!");

    this.size = size;
  }

  cloneState(other: QueensSimulation) {
    this.cells = other.cells.map(row => [...row]);
    this._currentPlayer = other.currentPlayer;
    this._playableCells = [...other.playableCells];
    this._state = other.state;
  }

  public init() {
    for (let i = 0; i < this.size[1]; i++) this.cells.push(new Array(this.size[0]).fill(0));

    for (let y = 0; y < this.size[1]; y++) {
      for (let x = 0; x < this.size[0]; x++) {
        this._playableCells.push([y, x]);
      }
    }

    this.setGameState(GameState.Place, Player.Player1);
  }

  private updatePlayableCells(queen: CellPosition) {
    const purge: number[] = [];

    for (let i = 0; i < this._playableCells.length; i++) {
      const cell = this._playableCells[i];

      const yOffset = Math.abs(cell[0] - queen[0]);
      const xOffset = Math.abs(cell[1] - queen[1]);
      if (cell[0] == queen[0] || cell[1] == queen[1] || xOffset == yOffset) {
        this.setCellState(cell, CellState.Forbidden);
        purge.push(i);
      }
    }

    for (let i = 0; i < purge.length; i++) {
      this._playableCells.splice(purge[i] - i, 1); // Use i as an offset since each deletion brings all indexes back by 1
    }
  }

  private placeQueen(queen: CellPosition) {
    this.updatePlayableCells(queen);
    this.setCellState(queen, this.currentPlayer + 1); // currentPlayer + 1 (Player enum to CellState enum)
  }

  public makePlay(cell: CellPosition, unsafe: boolean = false): boolean {
    if (!unsafe && !this.isLegalPlay(cell)) return false;
    if (this.state == GameState.Win) return false;

    this.placeQueen(cell);

    const winner = this.checkWin();
    if (winner != null) {
      this.setGameState(GameState.Win, winner);
      return true;
    }

    this.setGameState(GameState.Place, 1 - this.currentPlayer); // 1 - currentPlayer (Flip current player)

    return true;
  }

  private isLegalPlay(cell: CellPosition): boolean {
    for (const position of this.playableCells) {
      if (position[0] == cell[0] && position[1] == cell[1]) return true;
    }

    return false;
  }

  private checkWin(): Player | null {
    return this.playableCells.length == 0 ? this.currentPlayer : null;
  }

  private setCellState(position: CellPosition, state: CellState) {
    this.cells[position[0]][position[1]] = state;
    this.onCellStateChange.send(position, state);
  }

  private setGameState(state: GameState, player: Player) {
    this._state = state;
    this._currentPlayer = player;
    this.onGameStateChange.send(state, player);
  }
}

export { QueensSimulation, CellPosition, CellState, GameState, Player };
