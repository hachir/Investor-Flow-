// Evaluates the arithmetic, PMT and CUMPRINC formulas present in the supplied workbook.
// Formula text is parsed, never executed as JavaScript.
export function pmt(rate, periods, principal) {
  return rate === 0 ? -principal / periods : -principal * rate / (1 - Math.pow(1 + rate, -periods));
}
export function cumulativePrincipal(rate, periods, principal, start, end, type) {
  if (rate <= 0 || periods <= 0 || principal <= 0 || start < 1 || end > periods || start > end || type !== 0) throw Error('#NUM!');
  const payment = pmt(rate, periods, principal);
  let balance = principal, total = 0;
  for (let month = 1; month <= end; month++) {
    const paidPrincipal = payment + balance * rate;
    if (month >= start) total += paidPrincipal;
    balance += paidPrincipal;
  }
  return total;
}
export function calculateRow(row, overrides = {}) {
  const cache = {}, visiting = new Set();
  const get = (col) => {
    if (Object.hasOwn(cache, col)) return cache[col];
    if (Object.hasOwn(overrides, col)) return overrides[col];
    const cell = row.cells[col];
    if (!cell) return 0;
    if (!cell.f) return cell.v;
    if (visiting.has(col)) throw Error('#REF!');
    visiting.add(col);
    try { cache[col] = evaluate(cell.f, ref => {
      const m = ref.match(/^\$?([A-Z]+)\$?(\d+)$/);
      if (!m || Number(m[2]) !== row.row) throw Error('#REF!');
      const value = get(m[1]);
      if (typeof value === 'string' && value.startsWith('#')) throw Error(value);
      return Number(value) || 0;
    }); } catch (e) { cache[col] = e.message; }
    visiting.delete(col);
    return cache[col];
  };
  return Object.fromEntries(Object.keys(row.cells).map(col => [col, get(col)]));
}
function evaluate(formula, ref) {
  const tokens = formula.match(/\$?[A-Z]+\$?\d+|[A-Z]+|\d+(?:\.\d*)?|[()+\-*/^,]/gi) || [];
  if (tokens.join('').toUpperCase() !== formula.replace(/\s/g,'').toUpperCase()) throw Error('#NAME?');
  let i = 0;
  function atom() {
    const t = tokens[i++];
    if (t === '+') return atom();
    if (t === '-') return -atom();
    if (t === '(') { const v = expr(); if (tokens[i++] !== ')') throw Error('#VALUE!'); return v; }
    if (/^\d/.test(t || '')) return Number(t);
    if (/\d$/.test(t || '')) return ref(t.toUpperCase());
    if (tokens[i++] !== '(') throw Error('#NAME?');
    const args = [expr()];
    while (tokens[i] === ',') { i++; args.push(expr()); }
    if (tokens[i++] !== ')') throw Error('#VALUE!');
    if (t.toUpperCase() === 'PMT') return pmt(...args);
    if (t.toUpperCase() === 'CUMPRINC') return cumulativePrincipal(...args);
    throw Error('#NAME?');
  }
  function power() { let v = atom(); if (tokens[i] === '^') { i++; v = Math.pow(v, power()); } return v; }
  function product() { let v = power(); while (['*','/'].includes(tokens[i])) { const op=tokens[i++], b=power(); if(op==='/' && b===0) throw Error('#DIV/0!'); v=op==='*'?v*b:v/b; } return v; }
  function expr() { let v=product(); while (['+','-'].includes(tokens[i])) { const op=tokens[i++],b=product();v=op==='+'?v+b:v-b; } return v; }
  const value=expr(); if(i!==tokens.length) throw Error('#VALUE!');
  return Number.isFinite(value)?value:'#NUM!';
}
