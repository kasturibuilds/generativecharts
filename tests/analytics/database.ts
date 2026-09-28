import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import type { Database, Statement } from "../../worker/database";

export function testDatabase() {
  const sqlite = new DatabaseSync(":memory:");
  for (const file of readdirSync("drizzle").filter((name) => name.endsWith(".sql")).sort()) sqlite.exec(readFileSync(`drizzle/${file}`, "utf8"));
  class Query implements Statement {
    constructor(readonly sql: string, readonly values: (string | number)[] = []) {}
    bind(...values: (string | number)[]) { return new Query(this.sql, values); }
    async first<T>() { return (sqlite.prepare(this.sql).get(...this.values) ?? null) as T | null; }
    async all<T>() { return { results: sqlite.prepare(this.sql).all(...this.values) as T[], success: true }; }
  }
  const db: Database = {
    prepare: (sql) => new Query(sql),
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) {
          const query = statement as Query;
          results.push(sqlite.prepare(query.sql).run(...query.values));
        }
        sqlite.exec("COMMIT");
        return results;
      } catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  return { sqlite, db };
}
