import { trackEvent } from "./analytics";

type Mark = "X" | "O";
type Cell = Mark | "";
type Winner = Mark | "draw";

interface Outcome {
  winner: Winner;
  line: number[];
}

const HUMAN: Mark = "X";
const AI: Mark = "O";

const winningLines: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const getOutcome = (board: Cell[]): Outcome | null => {
  for (const line of winningLines) {
    const [a, b, c] = line;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return {
        winner: board[a] as Mark,
        line
      };
    }
  }

  return board.every(Boolean)
    ? { winner: "draw", line: [] }
    : null;
};

const getEmptyCells = (board: Cell[]): number[] =>
  board
    .map((cell, index) => cell ? -1 : index)
    .filter(index => index !== -1);

const minimax = (
  board: Cell[],
  maximizing: boolean
): number => {
  const outcome = getOutcome(board);

  if (outcome) {
    if (outcome.winner === AI) return 10;
    if (outcome.winner === HUMAN) return -10;
    return 0;
  }

  if (maximizing) {
    let best = -Infinity;

    getEmptyCells(board).forEach(index => {
      board[index] = AI;
      best = Math.max(best, minimax(board, false));
      board[index] = "";
    });

    return best;
  }

  let best = Infinity;

  getEmptyCells(board).forEach(index => {
    board[index] = HUMAN;
    best = Math.min(best, minimax(board, true));
    board[index] = "";
  });

  return best;
};

const getBestMoves = (board: Cell[]): number[] => {
  let bestScore = -Infinity;
  let choices: number[] = [];

  getEmptyCells(board).forEach(index => {
    board[index] = AI;
    const score = minimax(board, false);
    board[index] = "";

    if (score > bestScore) {
      bestScore = score;
      choices = [index];
    } else if (score === bestScore) {
      choices.push(index);
    }
  });

  return choices;
};

const findImmediateMove = (
  board: Cell[],
  mark: Mark
): number | undefined => {
  for (const index of getEmptyCells(board)) {
    board[index] = mark;
    const outcome = getOutcome(board);
    board[index] = "";

    if (outcome?.winner === mark) {
      return index;
    }
  }

  return undefined;
};

const randomItem = <T>(items: T[]): T | undefined =>
  items[Math.floor(Math.random() * items.length)];

const makeRewardCode = (): string => {
  const date = new Date()
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");

  const suffix = Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase();

  return `SF-${date}-${suffix}`;
};

export const initChallenge = (): void => {
  const root = document.querySelector<HTMLElement>("[data-challenge]");

  if (!root) return;

  const boardElement = root.querySelector<HTMLElement>("[data-challenge-board]");
  const speech = root.querySelector<HTMLElement>("[data-challenge-speech]");
  const turnText = root.querySelector<HTMLElement>("[data-challenge-turn]");
  const turnMark = root.querySelector<HTMLElement>("[data-challenge-turn-mark]");
  const reward = root.querySelector<HTMLElement>("[data-challenge-reward]");
  const resetButton = root.querySelector<HTMLButtonElement>("[data-challenge-reset]");
  const copyButton = root.querySelector<HTMLButtonElement>("[data-challenge-copy]");
  const codeElement = root.querySelector<HTMLElement>("[data-challenge-code]");
  const claimLink = root.querySelector<HTMLAnchorElement>("[data-challenge-claim]");
  const attemptContainer = root.querySelector<HTMLElement>("[data-challenge-attempts]");

  if (
    !boardElement ||
    !speech ||
    !turnText ||
    !turnMark ||
    !reward ||
    !resetButton ||
    !copyButton ||
    !codeElement ||
    !claimLink ||
    !attemptContainer
  ) {
    return;
  }

  const attemptDots = Array.from(
    attemptContainer.querySelectorAll<HTMLElement>("i")
  );

  const aiLines = [
    "Interessante. Eu teria escolhido outro caminho, mas vamos ver onde isso chega.",
    "Analisando possibilidades. Você ainda pode me surpreender.",
    "Boa jogada. Agora deixe comigo.",
    "Você está pensando à frente — gosto disso."
  ];

  const lossLines = [
    "Primeira rodada para mim. Ajuste sua estratégia e tente novamente.",
    "Quase. Agora você já conhece parte do meu jogo.",
    "Última tentativa. Sem pressão — apenas uma consultoria em jogo."
  ];

  let board: Cell[] = Array<Cell>(9).fill("");
  let attemptsLeft = 3;
  let locked = false;
  let finished = false;
  let roundStarted = false;
  let aiTimer: number | undefined;

  const updateAttempts = (): void => {
    attemptDots.forEach((dot, index) => {
      dot.classList.toggle("is-used", index >= attemptsLeft);
    });

    attemptContainer.setAttribute(
      "aria-label",
      `${attemptsLeft} tentativa${attemptsLeft === 1 ? "" : "s"} restante${attemptsLeft === 1 ? "" : "s"}`
    );
  };

  const renderBoard = (): void => {
    Array.from(boardElement.children).forEach((element, index) => {
      const cell = element as HTMLButtonElement;
      const mark = board[index];

      cell.textContent = mark;
      cell.dataset.mark = mark;
      cell.disabled = Boolean(mark) || locked || finished;
      cell.setAttribute(
        "aria-label",
        mark
          ? `Casa ${index + 1}, marcada com ${mark}`
          : `Casa ${index + 1}, disponível`
      );
    });

    updateAttempts();
  };

  const chooseAiMove = (): number | undefined => {
    const available = getEmptyCells(board);
    const winningMove = findImmediateMove(board, AI);

    if (winningMove !== undefined) {
      return winningMove;
    }

    const blockingMove = findImmediateMove(board, HUMAN);

    if (blockingMove !== undefined) {
      return blockingMove;
    }

    const optimalMoves = getBestMoves(board);
    const optimalChance = 0.72;

    if (Math.random() < optimalChance) {
      return randomItem(optimalMoves);
    }

    const casualMoves = available.filter(
      index => !optimalMoves.includes(index)
    );

    return randomItem(casualMoves.length ? casualMoves : available);
  };

  const showReward = (): void => {
    const code = makeRewardCode();
    const message = [
      "Olá, Julian! Venci o Desafio da Sexta-Feira no seu portfólio.",
      `Meu código de vitória é: ${code}.`,
      "Gostaria de solicitar a consultoria inicial gratuita."
    ].join("\n\n");

    codeElement.textContent = code;
    claimLink.href = `https://wa.me/5569992667022?text=${encodeURIComponent(message)}`;
    reward.classList.add("is-visible");
    reward.setAttribute("aria-hidden", "false");

    trackEvent("challenge_reward_unlocked", {
      attempts_remaining: attemptsLeft
    });
  };

  const finishRound = (outcome: Outcome): void => {
    finished = true;
    locked = true;
    renderBoard();

    outcome.line.forEach(index => {
      boardElement.children[index]?.classList.add("is-winner");
    });

    if (outcome.winner === HUMAN) {
      speech.textContent = "Vitória confirmada. Você ganhou — e eu cumpro o que prometo.";
      turnText.textContent = "Você venceu";
      turnMark.textContent = "✓";

      trackEvent("challenge_result", {
        result: "win",
        attempts_remaining: attemptsLeft
      });

      window.setTimeout(showReward, 650);
      return;
    }

    attemptsLeft = Math.max(0, attemptsLeft - 1);
    updateAttempts();

    const noAttempts = attemptsLeft === 0;

    if (outcome.winner === "draw") {
      speech.textContent = noAttempts
        ? "Foi um empate digno. O desafio termina aqui — por enquanto."
        : "Empate. Ninguém venceu, mas você continua no jogo.";
      turnText.textContent = "Empate";
    } else {
      speech.textContent = noAttempts
        ? "Essa foi a última rodada. Mas admito: você me deu trabalho."
        : lossLines[2 - attemptsLeft];
      turnText.textContent = "Sexta-Feira venceu";
    }

    resetButton.textContent = noAttempts
      ? "Recomeçar desafio"
      : "Próxima tentativa";

    trackEvent("challenge_result", {
      result: outcome.winner === "draw" ? "draw" : "loss",
      attempts_remaining: attemptsLeft
    });
  };

  const runAiTurn = (): void => {
    if (finished) return;

    locked = true;
    renderBoard();
    turnText.textContent = "Sexta-Feira pensando";
    turnMark.textContent = AI;
    speech.textContent = randomItem(aiLines) ?? aiLines[0];
    speech.classList.add("is-thinking");

    aiTimer = window.setTimeout(() => {
      const move = chooseAiMove();

      if (move !== undefined) {
        board[move] = AI;
      }

      speech.classList.remove("is-thinking");
      const outcome = getOutcome(board);

      if (outcome) {
        renderBoard();
        finishRound(outcome);
        return;
      }

      locked = false;
      turnText.textContent = "Sua vez";
      turnMark.textContent = HUMAN;
      speech.textContent = "Sua vez. Estou observando o padrão das suas escolhas.";
      renderBoard();
    }, 620);
  };

  const play = (index: number): void => {
    if (locked || finished || board[index]) return;

    if (!roundStarted) {
      roundStarted = true;
      trackEvent("challenge_started", {
        attempt: 4 - attemptsLeft
      });
    }

    board[index] = HUMAN;
    renderBoard();

    const outcome = getOutcome(board);

    if (outcome) {
      finishRound(outcome);
      return;
    }

    runAiTurn();
  };

  const createBoard = (): void => {
    boardElement.innerHTML = "";

    for (let index = 0; index < 9; index += 1) {
      const cell = document.createElement("button");

      cell.className = "challenge__cell";
      cell.type = "button";
      cell.setAttribute("role", "gridcell");
      cell.addEventListener("click", () => play(index));
      boardElement.appendChild(cell);
    }
  };

  const newRound = (restartChallenge = false): void => {
    if (aiTimer !== undefined) {
      window.clearTimeout(aiTimer);
    }

    if (restartChallenge || attemptsLeft === 0) {
      attemptsLeft = 3;
    }

    board = Array<Cell>(9).fill("");
    locked = false;
    finished = false;
    roundStarted = false;
    reward.classList.remove("is-visible");
    reward.setAttribute("aria-hidden", "true");
    createBoard();
    renderBoard();
    turnText.textContent = "Sua vez";
    turnMark.textContent = HUMAN;
    resetButton.textContent = "Reiniciar partida";
    speech.classList.remove("is-thinking");
    speech.textContent = attemptsLeft === 3
      ? "Você começa. Escolha uma casa — prometo não subestimar sua estratégia."
      : "Nova rodada. Já aprendi algumas coisas sobre o seu jeito de jogar.";
  };

  resetButton.addEventListener("click", () => {
    if (!finished && board.some(Boolean)) {
      attemptsLeft = Math.max(0, attemptsLeft - 1);
      trackEvent("challenge_reset", {
        attempts_remaining: attemptsLeft
      });
    }

    newRound(attemptsLeft === 0);
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(codeElement.textContent ?? "");
      copyButton.textContent = "COPIADO ✓";
    } catch {
      copyButton.textContent = "COPIE O CÓDIGO";
    }
  });

  createBoard();
  renderBoard();
};
