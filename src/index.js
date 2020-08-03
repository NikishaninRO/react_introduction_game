import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} id={props.id}>
      {props.value}
    </button>
  );
}

function GameBoard(props) {
  return (
    <div className="game-board">
      <Board squares={props.squares} onClick={props.onClick} />
    </div>
  );
}

function GameInfo(props) {
  return (
    <div className="game-info">
      <div>{props.status}</div>
      <ol>{props.getMoves()}</ol>
    </div>
  );
}

function SortButton(props) {
  return (
    <div className="sort-button">
      <button onClick={props.changeOrder}>
        {`Выводить ходы в ${
          props.greater ? "обратном порядке" : "обычном порядке"
        }`}
      </button>
    </div>
  );
}

function GameItems(props) {
  return (
    <div className="game-items">
      <GameBoard squares={props.squares} onClick={props.onClick} />
      <GameInfo status={props.status} getMoves={props.getMoves} />
      <SortButton changeOrder={props.changeOrder} greater={props.greater} />
    </div>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        id={i}
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  genetateSquares() {
    let rows = [];
    for (let i = 0; i < 9; ) {
      let row = [];
      for (let j = 0; j < 3; ++j) {
        row.push(this.renderSquare(i++));
      }
      rows.push(
        <div key={Math.trunc(i / 3)} className="board-row">
          {row}
        </div>
      );
    }
    return rows;
  }

  render() {
    return <div>{this.genetateSquares()}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          chosenSquare: null,
          whoMoved: null,
        },
      ],
      xIsNext: true,
      stepNumber: 0,
      greater: true,
    };
    this.winSquares = null;
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (this.calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState((state) => ({
      history: history.concat([
        {
          squares: squares,
          chosenSquare: i,
          whoMoved: state.xIsNext ? "X" : "O",
        },
      ]),
      xIsNext: !state.xIsNext,
      stepNumber: history.length,
    }));
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  changeOrder() {
    this.setState((state) => ({
      greater: !state.greater,
    }));
  }

  calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        this.winSquares = [a, b, c];
        return squares[a];
      }
    }

    return null;
  }

  boardIsFull(squares) {
    for (let i = 0; i < 9; ++i) {
      if (squares[i] === null) {
        return false;
      }
    }
    return true;
  }

  render() {
    let history = this.state.history.slice();
    const current = history[this.state.stepNumber];

    const winner = this.calculateWinner(current.squares);
    let status;
    if (winner) {
      status = "Выиграл " + winner;
      for (let squareNum of this.winSquares) {
        const square = document.getElementById(squareNum);
        square.style.background = "yellow";
      }
    } else if (!this.boardIsFull(current.squares)) {
      status = "Следующий ход: " + (this.state.xIsNext ? "X" : "O");
      if (this.winSquares !== null) {
        for (let squareNum = 0; squareNum < 9; ++squareNum) {
          const square = document.getElementById(squareNum);
          square.style.background = "white";
        }
      }
    } else {
      status = "Ничья";
    }

    if (!this.state.greater) {
      history.reverse();
    }

    function getMoves() {
      return history.map((value, index) => (
        <li key={this.state.greater ? index : history.length - 1 - index}>
          <button
            onClick={() =>
              this.jumpTo(
                this.state.greater ? index : history.length - 1 - index
              )
            }
          >
            {(index === 0 && this.state.greater) ||
            (index === history.length - 1 && !this.state.greater)
              ? "Перейти к началу игры"
              : `Перейти к ходу #${
                  this.state.greater ? index : history.length - 1 - index
                } 
                                (${Math.trunc(value.chosenSquare / 3)}; 
                                ${value.chosenSquare % 3}) - ${value.whoMoved}`}
          </button>
        </li>
      ));
    }

    return (
      <div className="game">
        <GameItems
          squares={current.squares}
          onClick={(i) => this.handleClick(i)}
          status={status}
          getMoves={getMoves.bind(this)}
          changeOrder={this.changeOrder.bind(this)}
          greater={this.state.greater}
        />
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
