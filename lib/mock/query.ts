import { loadDb, saveDb, uid, type MockDb, CLINIC_ID } from "./seed";

type Row = Record<string, any>;

function getTable(db: MockDb, table: string): Row[] {
  return (db as any)[table] ?? [];
}

function setTable(db: MockDb, table: string, rows: Row[]) {
  (db as any)[table] = rows;
}

function parseJoins(select: string): { fields: string[]; joins: { alias: string; table: string; fields: string[] }[] } {
  const joins: { alias: string; table: string; fields: string[] }[] = [];
  let base = select;
  const joinRegex = /(\w+):(\w+)\(([^)]+)\)/g;
  let m;
  while ((m = joinRegex.exec(select)) !== null) {
    joins.push({ alias: m[1], table: m[2], fields: m[3].split(",").map((f) => f.trim()) });
    base = base.replace(m[0], "");
  }
  const fields = base.replace(/\*/g, "*").split(",").map((f) => f.trim()).filter(Boolean);
  return { fields, joins };
}

function applyJoins(row: Row, joins: ReturnType<typeof parseJoins>["joins"], db: MockDb): Row {
  const out = { ...row };
  for (const j of joins) {
    const related = getTable(db, j.table);
    let match: Row | undefined;
    if (j.table === "patients") match = related.find((r) => r.id === row.patient_id);
    else if (j.table === "procedures") match = related.find((r) => r.id === row.procedure_id);
    else if (j.table === "profiles") match = related.find((r) => r.id === row.user_id);
    else if (j.table === "clinics") match = related.find((r) => r.id === row.clinic_id);
    if (match) {
      if (j.fields.length === 1 && j.fields[0] === "*") {
        out[j.alias] = { ...match };
      } else {
        const picked: Row = {};
        for (const f of j.fields) picked[f] = match[f];
        out[j.alias] = picked;
      }
    } else {
      out[j.alias] = null;
    }
  }
  return out;
}

class MockQuery {
  private table: string;
  private filters: ((r: Row) => boolean)[] = [];
  private sortFn: ((a: Row, b: Row) => number) | null = null;
  private limitN: number | null = null;
  private selectStr = "*";
  private countMode = false;
  private headMode = false;
  private isSingle = false;
  private isMaybeSingle = false;
  private pendingInsert: Row | Row[] | null = null;
  private pendingUpdate: Row | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields = "*", opts?: { count?: string; head?: boolean }) {
    this.selectStr = fields;
    if (opts?.count === "exact") this.countMode = true;
    if (opts?.head) this.headMode = true;
    return this;
  }

  insert(data: Row | Row[]) {
    this.pendingInsert = data;
    return this;
  }

  update(data: Row) {
    this.pendingUpdate = data;
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }

  gte(col: string, val: unknown) {
    this.filters.push((r) => String(r[col]) >= String(val));
    return this;
  }

  lte(col: string, val: unknown) {
    this.filters.push((r) => String(r[col]) <= String(val));
    return this;
  }

  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }

  ilike(col: string, pattern: string) {
    const p = pattern.replace(/%/g, "").toLowerCase();
    this.filters.push((r) => String(r[col] ?? "").toLowerCase().includes(p));
    return this;
  }

  or(_filter: string) {
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    const asc = opts?.ascending !== false;
    this.sortFn = (a, b) => {
      const av = a[col], bv = b[col];
      if (av < bv) return asc ? -1 : 1;
      if (av > bv) return asc ? 1 : -1;
      return 0;
    };
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  single() { this.isSingle = true; return this; }
  maybeSingle() { this.isMaybeSingle = true; return this; }

  then(resolve: (val: any) => void, reject?: (e: unknown) => void) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    const db = loadDb();

    if (this.pendingInsert) {
      const rows = Array.isArray(this.pendingInsert) ? this.pendingInsert : [this.pendingInsert];
      const table = getTable(db, this.table);
      const inserted = rows.map((r) => ({ id: r.id ?? uid(this.table), created_at: new Date().toISOString(), ...r }));
      setTable(db, this.table, [...table, ...inserted]);
      saveDb(db);
      const data = inserted.length === 1 ? inserted[0] : inserted;
      return { data: this.isSingle ? inserted[0] : data, error: null, count: inserted.length };
    }

    if (this.pendingUpdate) {
      let table = getTable(db, this.table);
      table = table.map((r) => (this.filters.every((f) => f(r)) ? { ...r, ...this.pendingUpdate } : r));
      setTable(db, this.table, table);
      saveDb(db);
      return { data: null, error: null };
    }

    let rows = getTable(db, this.table).filter((r) => this.filters.every((f) => f(r)));
    if (this.sortFn) rows = [...rows].sort(this.sortFn);
    if (this.limitN) rows = rows.slice(0, this.limitN);

    if (this.countMode) {
      return { data: this.headMode ? null : rows, count: rows.length, error: null };
    }

    const { joins } = parseJoins(this.selectStr);
    rows = rows.map((r) => applyJoins(r, joins, db));

    if (this.isSingle) {
      if (rows.length === 0) return { data: null, error: { message: "Not found" }, count: 0 };
      return { data: rows[0], error: null, count: 1 };
    }
    if (this.isMaybeSingle) {
      return { data: rows[0] ?? null, error: null, count: rows.length };
    }

    return { data: rows, error: null, count: rows.length };
  }
}

export async function mockRpc(fn: string, args: Record<string, unknown>) {
  const db = loadDb();
  const clinicId = (args.p_clinic_id as string) ?? CLINIC_ID;

  if (fn === "generate_file_number") {
    const patients = getTable(db, "patients").filter((p) => p.clinic_id === clinicId);
    const nums = patients.map((p) => parseInt(p.file_number, 10)).filter((n) => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return { data: String(next).padStart(4, "0"), error: null };
  }

  if (fn === "generate_invoice_number") {
    const year = new Date().getFullYear();
    const invoices = getTable(db, "invoices").filter((i) => i.clinic_id === clinicId);
    const nums = invoices.map((i) => parseInt(String(i.invoice_number).split("-")[1] ?? "0", 10)).filter((n) => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    return { data: `${year}-${String(next).padStart(4, "0")}`, error: null };
  }

  if (fn === "seed_default_procedures") {
    return { data: null, error: null };
  }

  return { data: null, error: { message: "Unknown RPC" } };
}

export function mockFrom(table: string) {
  return new MockQuery(table);
}
