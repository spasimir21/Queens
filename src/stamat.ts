import { CellPosition, GameState, Player, QueensSimulation } from './simulation';

function evaluateState(simulation: QueensSimulation): number {
  if (simulation.state == GameState.Win) return simulation.currentPlayer == Player.Player2 ? Infinity : -Infinity;
  return simulation.playableCells.length;
}

// Minimax Algorithm
function minimax(
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  prevSimulation: QueensSimulation,
  lastMove?: CellPosition
): [CellPosition | null, number] {
  const simulation = new QueensSimulation(prevSimulation.size);
  simulation.cloneState(prevSimulation);
  if (lastMove) simulation.makePlay(lastMove);

  if (depth == 0 || simulation.state == GameState.Win) return [null, evaluateState(simulation)];

  if (maximizing) {
    let maxEval = -Infinity;
    let maxMove: CellPosition;
    for (const move of simulation.playableCells) {
      const [_, evaluation] = minimax(depth - 1, alpha, beta, false, simulation, move);

      if (maxEval < evaluation || (maxEval == evaluation && Math.random() < 0.5)) {
        maxEval = evaluation;
        maxMove = move;
      }

      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return [maxMove, maxEval];
  } else {
    let minEval = Infinity;
    let minMove: CellPosition;
    for (const move of simulation.playableCells) {
      const [_, evaluation] = minimax(depth - 1, alpha, beta, true, simulation, move);

      if (minEval > evaluation || (minEval == evaluation && Math.random() < 0.5)) {
        minEval = evaluation;
        minMove = move;
      }

      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return [minMove, minEval];
  }
}

class Stamat {
  private readonly simulation: QueensSimulation;
  private readonly moves: CellPosition[] = [];
  public readonly difficulty: number;

  constructor(difficulty: number, simulation: QueensSimulation) {
    this.simulation = simulation;
    this.difficulty = difficulty;
  }

  public registerEnemyMove(move: CellPosition) {
    this.moves.push(move);
  }

  public makeMove() {
    // const move = this.simulation.playableCells[Math.floor(Math.random() * this.simulation.playableCells.length)];
    const [move, _evaluation] = minimax(this.difficulty, -Infinity, Infinity, true, this.simulation);

    this.simulation.makePlay(move);
    this.moves.push(move);
  }
}

export { Stamat };
