"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { PricePoint } from "../hooks/useSolPrice";

const COLS = 10;
const ROWS = 9;
const HISTORY_DURATION_MS = 10_000; // 10s per history column
const PREDICT_DURATION_MS = 3_000;  // 3s per prediction column
const RANGE_PERCENT = 0.0135;
const CELL_W = 90;
const CELL_H = 70;
const HISTORY_COLS = 3;
const PREDICT_COLS = COLS - HISTORY_COLS; // 7
const GAP = 2;
const GRID_W = COLS * (CELL_W + GAP) - GAP;
const GRID_H = ROWS * (CELL_H + GAP) - GAP;
const TOTAL_DURATION_MS = HISTORY_COLS * HISTORY_DURATION_MS + PREDICT_COLS * PREDICT_DURATION_MS;

// Get the start time offset of a column relative to game startTime
function colStartOffset(col: number): number {
  if (col <= HISTORY_COLS) return col * HISTORY_DURATION_MS;
  return HISTORY_COLS * HISTORY_DURATION_MS + (col - HISTORY_COLS) * PREDICT_DURATION_MS;
}

function colDuration(col: number): number {
  return col < HISTORY_COLS ? HISTORY_DURATION_MS : PREDICT_DURATION_MS;
}

// Map elapsed time (from startTime) to X position on grid
function elapsedToX(elapsed: number): number {
  // History zone
  if (elapsed <= HISTORY_COLS * HISTORY_DURATION_MS) {
    const historyW = HISTORY_COLS * (CELL_W + GAP);
    return (elapsed / (HISTORY_COLS * HISTORY_DURATION_MS)) * historyW;
  }
  // Prediction zone
  const historyW = HISTORY_COLS * (CELL_W + GAP);
  const predictElapsed = elapsed - HISTORY_COLS * HISTORY_DURATION_MS;
  const predictTotalMs = PREDICT_COLS * PREDICT_DURATION_MS;
  const predictW = PREDICT_COLS * (CELL_W + GAP);
  return historyW + (predictElapsed / predictTotalMs) * predictW;
}

// Map elapsed time to column index
function elapsedToCol(elapsed: number): number {
  if (elapsed <= HISTORY_COLS * HISTORY_DURATION_MS) {
    return Math.floor(elapsed / HISTORY_DURATION_MS);
  }
  const predictElapsed = elapsed - HISTORY_COLS * HISTORY_DURATION_MS;
  return HISTORY_COLS + Math.floor(predictElapsed / PREDICT_DURATION_MS);
}

interface CellState {
  selected: boolean;
  result: "pending" | "hit" | "miss" | "none";
}

interface Bet {
  col: number;
  priceTop: number;
  priceBottom: number;
  multiplier: number;
  amount: number;
  result: "pending" | "hit" | "miss";
}

// Multiplier based on columns remaining — more remaining = riskier = higher reward
function getMultiplier(col: number, currentCol: number): number {
  const remaining = col - currentCol;
  if (remaining <= 1) return 1.5;
  if (remaining <= 2) return 2;
  if (remaining <= 3) return 2.5;
  if (remaining <= 4) return 3;
  if (remaining <= 5) return 3.5;
  if (remaining <= 6) return 4.5;
  return 1.8;
}

interface Props {
  price: number | null;
  history: PricePoint[];
}

export default function PredictionGrid({ price, history }: Props) {
  const [anchorPrice, setAnchorPrice] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [cells, setCells] = useState<CellState[][]>(() => initCells());
  const [gameActive, setGameActive] = useState(false);
  const [currentCol, setCurrentCol] = useState(-1);
  const [score, setScore] = useState({ wins: 0, losses: 0 });
  const [bets, setBets] = useState<Bet[]>([]);
  const [betAmount, setBetAmount] = useState(0.1); // SOL per bet
  const [showModal, setShowModal] = useState(false);
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function initCells(): CellState[][] {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ selected: false, result: "none" }))
    );
  }

  // Before game: use live price as center. During game: use anchor
  const centerPrice = gameActive || currentCol >= COLS ? anchorPrice : price;

  const priceRange = useMemo(() => {
    if (!centerPrice) return null;
    const min = centerPrice * (1 - RANGE_PERCENT / 100);
    const max = centerPrice * (1 + RANGE_PERCENT / 100);
    const step = (max - min) / ROWS;
    return { min, max, step };
  }, [centerPrice]);

  // priceToY and priceToRow defined after activeRange below

  // Re-center when price exits the range during game
  useEffect(() => {
    if (!price || !priceRange || !gameActive) return;
    if (price < priceRange.min || price > priceRange.max) {
      setAnchorPrice(price);
    }
  }, [price, priceRange, gameActive]);

  // Dezoom at game end — expand range to cover all bets + prices
  const [dezoomed, setDezoomed] = useState(false);
  useEffect(() => {
    if (currentCol !== COLS || !startTime || dezoomed) return;
    const gameStart = startTime;
    const gameEnd = startTime + TOTAL_DURATION_MS;
    const gamePrices = history.filter((pt) => pt.timestamp >= gameStart && pt.timestamp <= gameEnd);
    if (gamePrices.length === 0 && bets.length === 0) return;

    let minP = gamePrices.length ? Math.min(...gamePrices.map((p) => p.price)) : Infinity;
    let maxP = gamePrices.length ? Math.max(...gamePrices.map((p) => p.price)) : -Infinity;
    // Include bet price ranges
    for (const bet of bets) {
      minP = Math.min(minP, bet.priceBottom);
      maxP = Math.max(maxP, bet.priceTop);
    }
    const padding = (maxP - minP) * 0.2 || 0.01;
    const mid = (minP + maxP) / 2;
    setAnchorPrice(mid);
    setDezoomed(true);
  }, [currentCol, startTime, history, dezoomed, bets]);

  // Override priceRange when dezoomed
  const dezoomedRange = useMemo(() => {
    if (!dezoomed || !startTime) return null;
    const gameEnd = startTime + TOTAL_DURATION_MS;
    const gamePrices = history.filter((pt) => pt.timestamp >= startTime && pt.timestamp <= gameEnd);
    let minP = gamePrices.length ? Math.min(...gamePrices.map((p) => p.price)) : Infinity;
    let maxP = gamePrices.length ? Math.max(...gamePrices.map((p) => p.price)) : -Infinity;
    for (const bet of bets) {
      minP = Math.min(minP, bet.priceBottom);
      maxP = Math.max(maxP, bet.priceTop);
    }
    const padding = (maxP - minP) * 0.2 || 0.01;
    const min = minP - padding;
    const max = maxP + padding;
    const step = (max - min) / ROWS;
    return { min, max, step };
  }, [dezoomed, startTime, history, bets]);

  const activeRange = dezoomedRange || priceRange;

  const priceToY = useCallback(
    (p: number): number => {
      if (!activeRange) return GRID_H / 2;
      const ratio = (activeRange.max - p) / (activeRange.max - activeRange.min);
      return Math.max(0, Math.min(GRID_H, ratio * GRID_H));
    },
    [activeRange]
  );

  const priceToRow = useCallback(
    (p: number): number | null => {
      if (!activeRange) return null;
      const row = Math.floor((activeRange.max - p) / activeRange.step);
      if (row < 0) return 0;
      if (row >= ROWS) return ROWS - 1;
      return row;
    },
    [activeRange]
  );

  const startGame = useCallback(() => {
    if (!price) return;
    setAnchorPrice(price);
    setDezoomed(false);
    setBets([]);
    setStartTime(Date.now() - HISTORY_COLS * HISTORY_DURATION_MS);
    setCells(initCells());
    setGameActive(true);
    setCurrentCol(HISTORY_COLS);
  }, [price]);

  // Tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!gameActive || !startTime) return;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const col = elapsedToCol(elapsed);
      if (col >= COLS || elapsed >= TOTAL_DURATION_MS) {
        setGameActive(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setCurrentCol(COLS);
        return;
      }
      setCurrentCol(col);
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [gameActive, startTime]);

  // Resolve bets using stored price bounds
  useEffect(() => {
    if (!startTime || currentCol < HISTORY_COLS) return;
    setBets((prev) => {
      let w = 0, l = 0;
      const next = prev.map((bet) => {
        if (bet.result !== "pending") return bet;
        const cStart = startTime + colStartOffset(bet.col);
        const cEnd = cStart + colDuration(bet.col);
        const colPrices = history.filter((pt) => pt.timestamp >= cStart && pt.timestamp < cEnd);
        const hit = colPrices.some((pt) => pt.price >= bet.priceBottom && pt.price < bet.priceTop);
        // Only finalize if column is fully past
        const colDone = bet.col < currentCol || currentCol >= COLS;
        if (colDone) {
          if (hit) { w++; return { ...bet, result: "hit" as const }; }
          else { l++; return { ...bet, result: "miss" as const }; }
        }
        return bet;
      });
      if (w || l) setScore((s) => ({ wins: s.wins + w, losses: s.losses + l }));
      return next;
    });
  }, [currentCol, history, startTime]);

  // Resolution now handled by bets array above

  // Draw chart — always, not just during game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeRange) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = GRID_W * dpr;
    canvas.height = GRID_H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, GRID_W, GRID_H);

    let windowStart: number;
    let drawEnd: number;
    if (startTime && (gameActive || currentCol >= COLS)) {
      windowStart = startTime;
      drawEnd = gameActive ? now : startTime + TOTAL_DURATION_MS;
    } else {
      windowStart = now - HISTORY_COLS * HISTORY_DURATION_MS;
      drawEnd = now;
    }

    const pts = history.filter((pt) => pt.timestamp >= windowStart && pt.timestamp <= drawEnd);
    if (pts.length < 2) return;

    // Map timestamp to X using variable column widths
    const timeToX = (t: number) => elapsedToX(t - windowStart);


    // Gradient fill under curve
    const grad = ctx.createLinearGradient(0, 0, 0, GRID_H);
    grad.addColorStop(0, "rgba(34, 211, 238, 0.15)");
    grad.addColorStop(1, "rgba(34, 211, 238, 0.0)");

    ctx.beginPath();
    ctx.moveTo(timeToX(pts[0].timestamp), GRID_H);
    for (const pt of pts) {
      ctx.lineTo(timeToX(pt.timestamp), priceToY(pt.price));
    }
    ctx.lineTo(timeToX(pts[pts.length - 1].timestamp), GRID_H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Main line
    ctx.beginPath();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 4;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    let started = false;
    for (const pt of pts) {
      const x = timeToX(pt.timestamp);
      const y = priceToY(pt.price);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
    ctx.lineWidth = 10;
    ctx.lineJoin = "round";
    started = false;
    for (const pt of pts) {
      const x = timeToX(pt.timestamp);
      const y = priceToY(pt.price);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current dot
    const last = pts[pts.length - 1];
    const lx = timeToX(last.timestamp);
    const ly = priceToY(last.price);
    ctx.beginPath();
    ctx.arc(lx, ly, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#22d3ee";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 9, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Price label next to dot
    ctx.font = "bold 18px monospace";
    ctx.fillStyle = "#22d3ee";
    ctx.textAlign = lx > GRID_W - 80 ? "right" : "left";
    ctx.fillText(`$${last.price.toFixed(4)}`, lx + (lx > GRID_W - 80 ? -14 : 14), ly - 10);
  }, [history, now, startTime, priceRange, priceToY, gameActive, currentCol]);

  const toggleCell = (row: number, col: number) => {
    if (!gameActive || !activeRange) return;
    if (col <= currentCol) return;
    if (col < HISTORY_COLS) return;
    const priceTop = activeRange.max - row * activeRange.step;
    const priceBottom = priceTop - activeRange.step;
    setCells((prev) => {
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      const wasSelected = next[row][col].selected;
      next[row][col].selected = !wasSelected;
      return next;
    });
    // Store/remove bet with actual price bounds
    setBets((prev) => {
      const existing = prev.findIndex((b) => b.col === col && b.priceTop === priceTop && b.priceBottom === priceBottom);
      if (existing >= 0) return prev.filter((_, i) => i !== existing);
      return [...prev, { col, priceTop, priceBottom, multiplier: getMultiplier(col, currentCol), amount: betAmount, result: "pending" }];
    });
  };

  // Scroll offset: keep "now" pinned at HISTORY_COLS visual position
  const scrollOffset = useMemo(() => {
    if (!gameActive || !startTime) return 0;
    const elapsed = now - startTime;
    const nowX = elapsedToX(elapsed);
    const historyX = HISTORY_COLS * (CELL_W + GAP);
    return Math.max(0, nowX - historyX);
  }, [gameActive, startTime, now]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-8 flex-wrap justify-center">
        <div className="flex gap-4 text-sm font-mono">
          <span className="text-green-400">W {score.wins}</span>
          <span className="text-red-400">L {score.losses}</span>
        </div>
        {!gameActive && (
          <>
            <button
              onClick={() => setShowModal(true)}
              disabled={!price}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 rounded-xl font-bold text-white text-lg transition"
            >
              {currentCol >= COLS ? "New Round" : "Start"}
            </button>
            {currentCol >= COLS && (
              <button
                onClick={() => {
                  setStartTime(null);
                  setAnchorPrice(null);
                  setCells(initCells());
                  setBets([]);
                  setDezoomed(false);
                  setCurrentCol(-1);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition"
              >
                Watch
              </button>
            )}
          </>
        )}
        {gameActive && (
          <>
            <div className="text-sm text-gray-400 font-mono">
              {currentCol + 1}/{COLS} — {betAmount} SOL/bet
            </div>
            <button
              onClick={() => {
                setGameActive(false);
                setStartTime(null);
                setAnchorPrice(null);
                setCells(initCells());
                setBets([]);
                setDezoomed(false);
                setCurrentCol(-1);
                if (intervalRef.current) clearInterval(intervalRef.current);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-gray-300 transition"
            >
              Watch
            </button>
          </>
        )}
      </div>

      {/* Round summary */}
      {currentCol >= COLS && bets.length > 0 && (() => {
        const wins = bets.filter((b) => b.result === "hit");
        const losses = bets.filter((b) => b.result === "miss");
        const totalBet = bets.reduce((s, b) => s + b.amount, 0);
        const totalWon = wins.reduce((s, b) => s + b.amount * b.multiplier, 0);
        const net = totalWon - totalBet;
        return (
          <div className="w-full max-w-2xl bg-gray-900/80 border border-gray-700 rounded-xl p-4 font-mono text-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Round complete</span>
              <span className={`text-lg font-bold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
                {net >= 0 ? "+" : ""}{net.toFixed(4)} SOL
              </span>
            </div>
            <div className="flex gap-6 text-xs">
              <div>
                <span className="text-gray-500">Bets: </span>
                <span className="text-white">{bets.length}</span>
              </div>
              <div>
                <span className="text-gray-500">Staked: </span>
                <span className="text-white">{totalBet.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-500">Won: </span>
                <span className="text-green-400">{totalWon.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-green-400">{wins.length} hit</span>
                <span className="text-gray-600"> / </span>
                <span className="text-red-400">{losses.length} miss</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid + Chart */}
      <div className="relative flex">
        {/* Y-axis */}
        <div
          className="flex flex-col justify-between pr-3 text-xs text-gray-500 font-mono"
          style={{ height: GRID_H }}
        >
          {activeRange
            ? Array.from({ length: ROWS }, (_, i) => {
                const rowPrice = activeRange.max - i * activeRange.step;
                return (
                  <div key={i} className="flex items-center" style={{ height: CELL_H }}>
                    ${rowPrice.toFixed(4)}
                  </div>
                );
              })
            : Array.from({ length: ROWS }, (_, i) => (
                <div key={i} className="flex items-center" style={{ height: CELL_H }}>—</div>
              ))}
        </div>

        {/* Grid + canvas stack — clipped viewport */}
        <div className="relative overflow-hidden" style={{ width: GRID_W, height: GRID_H }}>
          {/* Scrolling inner container */}
          <div
            className="absolute"
            style={{
              width: GRID_W,
              height: GRID_H,
              transform: `translateX(-${scrollOffset}px)`,
              transition: "transform 50ms linear",
            }}
          >
          {/* Cell grid */}
          <div
            className="grid absolute inset-0"
            style={{
              gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL_H}px)`,
              gap: `${GAP}px`,
            }}
          >
            {/* Base grid cells — clickable */}
            {Array.from({ length: ROWS }, (_, ri) =>
              Array.from({ length: COLS }, (_, ci) => {
                const isHistory = ci < HISTORY_COLS;
                const isFuture = ci > currentCol;
                const isCurrent = ci === currentCol;
                const isBettable = gameActive && isFuture && !isHistory;

                let bg = "bg-gray-900/40";
                let border = "border-gray-800/40";
                let hover = isBettable ? "hover:bg-gray-700/50" : "";
                if (isHistory) { bg = "bg-gray-950/20"; border = "border-gray-800/20"; }
                if (isCurrent && gameActive) { border = "border-cyan-700/40"; }

                return (
                  <div
                    key={`${ri}-${ci}`}
                    onClick={() => toggleCell(ri, ci)}
                    className={`${bg} ${hover} rounded-md border ${border} flex items-center justify-center transition-all duration-100 ${isBettable ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {isBettable && <span className="text-[10px] text-gray-600 font-mono">x{getMultiplier(ci, currentCol)}</span>}
                  </div>
                );
              })
            )}
            </div>

            {/* Bet overlays — positioned by actual price */}
            {bets.map((bet, i) => {
              if (!activeRange) return null;
              // Map bet price to Y position in current range
              const yTop = ((activeRange.max - bet.priceTop) / (activeRange.max - activeRange.min)) * GRID_H;
              const yBot = ((activeRange.max - bet.priceBottom) / (activeRange.max - activeRange.min)) * GRID_H;
              const h = yBot - yTop;
              // X position from column
              const x = bet.col * (CELL_W + GAP);
              // Skip if completely out of visible Y range
              if (yBot < 0 || yTop > GRID_H) return null;

              const m = bet.multiplier;
              let borderColor = "border-cyan-400";
              let bgStyle = "rgba(6, 182, 212, 0.25)";
              let shadow = "0 0 12px rgba(6, 182, 212, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.15)";
              let textColor = "text-cyan-300";
              let textSize = "text-lg";
              if (bet.result === "hit") {
                borderColor = "border-green-400";
                bgStyle = "rgba(34, 197, 94, 0.3)";
                shadow = "0 0 16px rgba(34, 197, 94, 0.5), inset 0 0 10px rgba(34, 197, 94, 0.2)";
                textColor = "text-green-300";
              }
              if (bet.result === "miss") {
                borderColor = "border-red-500";
                bgStyle = "rgba(239, 68, 68, 0.25)";
                shadow = "0 0 12px rgba(239, 68, 68, 0.4), inset 0 0 8px rgba(239, 68, 68, 0.15)";
                textColor = "text-red-400";
              }

              return (
                <div
                  key={`bet-${i}`}
                  className={`absolute border-2 ${borderColor} rounded-lg flex items-center justify-center pointer-events-none`}
                  style={{
                    left: x,
                    top: Math.max(0, yTop),
                    width: CELL_W,
                    height: Math.min(h, GRID_H - Math.max(0, yTop)),
                    backgroundColor: bgStyle,
                    boxShadow: shadow,
                  }}
                >
                  <div className="flex flex-col items-center">
                    <span className={`${textColor} ${textSize} font-bold drop-shadow-lg`}>
                      {bet.result === "miss" ? "0" : `x${m}`}
                    </span>
                    <span className="text-[10px] text-gray-400">{bet.amount} SOL</span>
                  </div>
                </div>
              );
            })}

          {/* Chart canvas on top */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: GRID_W, height: GRID_H }}
          />

          {/* History/prediction separator — dashed subtle line */}
          {gameActive && (
            <div
              className="absolute top-0 w-px border-l border-dashed border-gray-600/30"
              style={{ left: HISTORY_COLS * (CELL_W + GAP) - GAP / 2, height: GRID_H }}
            />
          )}

          {/* Time marker */}
          {gameActive && startTime && (() => {
            const elapsed = now - startTime;
            const x = Math.min(elapsedToX(elapsed), GRID_W);
            return <div className="absolute top-0 w-px bg-cyan-400/30" style={{ left: x, height: GRID_H }} />;
          })()}
          </div>{/* close scrolling inner */}
        </div>
      </div>

      {/* X-axis */}
      <div className="flex text-xs text-gray-600 font-mono" style={{ paddingLeft: 76 }}>
        {Array.from({ length: COLS }, (_, i) => {
          const offsetMs = colStartOffset(i) - HISTORY_COLS * HISTORY_DURATION_MS;
          const seconds = Math.round(offsetMs / 1000);
          return (
            <div key={i} className={`text-center ${i < HISTORY_COLS ? "text-gray-700" : "text-gray-500"}`} style={{ width: CELL_W + GAP }}>
              {seconds === 0 ? "now" : `${seconds > 0 ? "+" : ""}${seconds}s`}
            </div>
          );
        })}
      </div>

      {/* Config modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Round Settings</h2>

            {/* Bet amount */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-3 block">Bet per cell</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={betAmount}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setBetAmount(v);
                  }}
                  className="w-24 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white font-mono text-sm text-right focus:outline-none focus:border-cyan-500"
                />
                <span className="text-sm text-gray-400">SOL</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  startGame();
                }}
                className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-bold text-lg transition"
              >
                GO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
