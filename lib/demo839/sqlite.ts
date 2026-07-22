import { DatabaseSync, type SQLInputValue, type StatementSync } from "node:sqlite";
import path from "node:path";

type RunResult = { meta: { last_row_id: number; changes: number } };

class DemoStatement {
  private readonly values: SQLInputValue[];

  constructor(
    private readonly statement: StatementSync,
    values: SQLInputValue[] = [],
  ) {
    this.values = values;
  }

  bind(...values: SQLInputValue[]): DemoStatement {
    return new DemoStatement(this.statement, values);
  }

  async first<T>(): Promise<T | null> {
    return (this.statement.get(...this.values) as T | undefined) ?? null;
  }

  async all<T>(): Promise<{ results: T[] }> {
    return { results: this.statement.all(...this.values) as T[] };
  }

  async run(): Promise<RunResult> {
    return this.runSync();
  }

  runSync(): RunResult {
    const result = this.statement.run(...this.values);
    return {
      meta: {
        last_row_id: Number(result.lastInsertRowid),
        changes: Number(result.changes),
      },
    };
  }
}

export class DemoDatabase {
  constructor(private readonly database: DatabaseSync) {}

  prepare(sql: string): DemoStatement {
    return new DemoStatement(this.database.prepare(sql));
  }

  async batch(statements: DemoStatement[]): Promise<RunResult[]> {
    this.database.exec("BEGIN");
    try {
      const results = statements.map((statement) => statement.runSync());
      this.database.exec("COMMIT");
      return results;
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}

const globalForDemo839 = globalThis as typeof globalThis & {
  demo839Database?: DemoDatabase;
};

function databasePath(): string {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  const value = url.startsWith("file:") ? url.slice(5) : url;
  return path.isAbsolute(value)
    ? value
    : path.join(/* turbopackIgnore: true */ process.cwd(), "prisma", "dev.db");
}

export function getDemoDatabase(): DemoDatabase {
  if (!globalForDemo839.demo839Database) {
    const database = new DatabaseSync(databasePath());
    database.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
    globalForDemo839.demo839Database = new DemoDatabase(database);
  }

  return globalForDemo839.demo839Database;
}
