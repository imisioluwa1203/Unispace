const FUNCS = {
  sin: (x, deg) => Math.sin(deg ? (x * Math.PI) / 180 : x),
  cos: (x, deg) => Math.cos(deg ? (x * Math.PI) / 180 : x),
  tan: (x, deg) => {
    const r = deg ? (x * Math.PI) / 180 : x;
    if (Math.abs(Math.cos(r)) < 1e-12) throw new Error("Undefined");
    return Math.tan(r);
  },
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
  sqrt: (x) => {
    if (x < 0) throw new Error("Invalid input");
    return Math.sqrt(x);
  },
};

const OPS = {
  "+": "+", "-": "-", "−": "-", "*": "*", "×": "*", "/": "/", "÷": "/",
  "^": "^", "(": "(", ")": ")", "%": "%",
};

function tokenize(text) {
  const tokens = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === " ") {
      i++;
    } else if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < text.length && /[0-9.]/.test(text[j])) j++;
      const num = Number(text.slice(i, j));
      if (Number.isNaN(num)) throw new Error("Bad number");
      tokens.push({ t: "num", v: num });
      i = j;
    } else if (/[a-z]/i.test(ch)) {
      let j = i;
      while (j < text.length && /[a-z]/i.test(text[j])) j++;
      const word = text.slice(i, j).toLowerCase();
      if (word === "ans") tokens.push({ t: "ans" });
      else if (FUNCS[word]) tokens.push({ t: "fn", v: word });
      else throw new Error("Unknown word");
      i = j;
    } else if (ch === "π") {
      tokens.push({ t: "pi" });
      i++;
    } else if (ch === "√") {
      tokens.push({ t: "fn", v: "sqrt" });
      i++;
    } else if (OPS[ch]) {
      tokens.push({ t: "op", v: OPS[ch] });
      i++;
    } else {
      throw new Error("Unknown symbol");
    }
  }
  return tokens;
}

export function evaluate(input, { degrees = true, ans = 0 } = {}) {
  // close any brackets the user left open
  let open = 0;
  for (const ch of input) {
    if (ch === "(") open++;
    if (ch === ")") open--;
  }
  const text = open > 0 ? input + ")".repeat(open) : input;

  const tokens = tokenize(text);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v) => peek() && peek().t === "op" && peek().v === v;
  const startsFactor = () => {
    const t = peek();
    return t && (t.t === "num" || t.t === "fn" || t.t === "pi" || t.t === "ans" || (t.t === "op" && t.v === "("));
  };

  function expr() {
    let value = term();
    while (isOp("+") || isOp("-")) {
      const op = tokens[pos++].v;
      const right = term();
      value = op === "+" ? value + right : value - right;
    }
    return value;
  }

  function term() {
    let value = unary();
    while (true) {
      if (isOp("*") || isOp("/")) {
        const op = tokens[pos++].v;
        const right = unary();
        if (op === "/" && right === 0) throw new Error("Cannot divide by zero");
        value = op === "*" ? value * right : value / right;
      } else if (startsFactor()) {
        value = value * unary(); // 2π and 3(4+5) mean multiply
      } else {
        break;
      }
    }
    return value;
  }

  function unary() {
    if (isOp("-")) {
      pos++;
      return -unary();
    }
    if (isOp("+")) {
      pos++;
      return unary();
    }
    return power();
  }

  function power() {
    const base = postfix();
    if (isOp("^")) {
      pos++;
      return Math.pow(base, unary());
    }
    return base;
  }

  function postfix() {
    let value = primary();
    while (isOp("%")) {
      pos++;
      value = value / 100;
    }
    return value;
  }

  function primary() {
    const t = tokens[pos++];
    if (!t) throw new Error("Incomplete");
    if (t.t === "num") return t.v;
    if (t.t === "pi") return Math.PI;
    if (t.t === "ans") return ans;
    if (t.t === "fn") return FUNCS[t.v](postfix(), degrees);
    if (t.t === "op" && t.v === "(") {
      const value = expr();
      if (!isOp(")")) throw new Error("Missing )");
      pos++;
      return value;
    }
    throw new Error("Unexpected symbol");
  }

  const result = expr();
  if (pos < tokens.length) throw new Error("Unexpected symbol");
  if (!Number.isFinite(result)) throw new Error("Invalid");
  return result;
}

export function formatNumber(value) {
  if (Math.abs(value) < 1e-12) return "0";
  return String(Number(value.toPrecision(12)));
}