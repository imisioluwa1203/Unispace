import { useState } from "react";
import { evaluate, formatNumber } from "./calc";
import { loadData, saveData } from "./Offline.js";
import { XIcon, BackspaceIcon } from "./Icons";

const SCI_KEYS = [
  ["√", "√("], ["x²", "^2"], ["xʸ", "^"], ["π", "π"],
  ["sin", "sin("], ["cos", "cos("], ["tan", "tan("], ["log", "log("],
];

const MAIN_KEYS = [
  ["C", "clear", "o"], ["( )", "bracket", "o"], ["%", "%", "o"], ["÷", "÷", "o"],
  ["7", "7"], ["8", "8"], ["9", "9"], ["×", "×", "o"],
  ["4", "4"], ["5", "5"], ["6", "6"], ["−", "−", "o"],
  ["1", "1"], ["2", "2"], ["3", "3"], ["+", "+", "o"],
  ["0", "0"], [".", "."], ["back", "back"], ["=", "equals", "e"],
];

export default function CalcPad({ compact = false, onClose }) {
  const [scientific, setScientific] = useState(() => loadData("calc_sci") === true);
  const [degrees, setDegrees] = useState(() => loadData("calc_deg") !== false);
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [ansValue, setAnsValue] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function setMode(next) {
    setScientific(next);
    saveData("calc_sci", next);
  }

  function toggleDegrees() {
    const next = !degrees;
    setDegrees(next);
    saveData("calc_deg", next);
  }

  function insert(text) {
    setError("");
    const continues = /^[+−×÷^%]/.test(text);
    if (done) {
      // after "=": an operator continues from the answer, anything else starts fresh
      setExpr(continues ? formatNumber(ansValue) + text : text);
      setDone(false);
      setResult("");
    } else {
      setExpr(expr + text);
    }
  }

  function bracket() {
    const source = done ? "" : expr;
    const open = (source.match(/\(/g) || []).length - (source.match(/\)/g) || []).length;
    const last = source.slice(-1);
    const afterValue = last !== "" && !/[+−×÷^(]/.test(last);
    insert(open > 0 && afterValue ? ")" : afterValue ? "×(" : "(");
  }

  function backspace() {
    setError("");
    if (done) {
      setDone(false);
      setResult("");
      return;
    }
    setExpr(expr.replace(/(sin|cos|tan|log|ln|√)\($|.$/, ""));
  }

  function clearAll() {
    setExpr("");
    setResult("");
    setDone(false);
    setError("");
  }

  function equals() {
    if (!expr) return;
    try {
      const value = evaluate(expr, { degrees, ans: ansValue });
      setAnsValue(value);
      setResult(formatNumber(value));
      setDone(true);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  function press(action) {
    if (action === "clear") return clearAll();
    if (action === "back") return backspace();
    if (action === "equals") return equals();
    if (action === "bracket") return bracket();
    return insert(action);
  }

  function livePreview() {
    if (!expr || done) return "";
    try {
      return formatNumber(evaluate(expr, { degrees, ans: ansValue }));
    } catch {
      return "";
    }
  }

  const big = error || (done ? result : livePreview());
  const bigClass = error ? "calc-big err" : done ? "calc-big" : "calc-big faint";

  return (
    <div className={compact ? "calc compact" : "calc"}>
      <div className="calc-toolbar">
        <button type="button" className={!scientific ? "chip on" : "chip"} onClick={() => setMode(false)}>Basic</button>
        <button type="button" className={scientific ? "chip on" : "chip"} onClick={() => setMode(true)}>Scientific</button>
        {scientific && (
          <button type="button" className="chip" onClick={toggleDegrees} aria-label="Angle unit">
            {degrees ? "DEG" : "RAD"}
          </button>
        )}
        <span className="chip-spacer" />
        {onClose && (
          <button type="button" className="x-btn" onClick={onClose} aria-label="Close calculator">
            <XIcon />
          </button>
        )}
      </div>

      <div className="calc-display" aria-live="polite">
        <div className="calc-expr">{expr || "\u00A0"}</div>
        <div className={bigClass}>{big || (expr ? "\u00A0" : "0")}</div>
      </div>

      <div className="calc-keys">
        {scientific &&
          SCI_KEYS.map(([label, action]) => (
            <button key={label} type="button" className="k s" onClick={() => press(action)}>{label}</button>
          ))}
        {MAIN_KEYS.map(([label, action, kind]) => (
          <button
            key={label}
            type="button"
            className={kind ? `k ${kind}` : "k"}
            onClick={() => press(action)}
            aria-label={action === "back" ? "Backspace" : action === "equals" ? "Equals" : undefined}
          >
            {action === "back" ? <BackspaceIcon /> : label}
          </button>
        ))}
      </div>
    </div>
  );
}