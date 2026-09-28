// The small subset of the platform D1 interface used by analytics.
export interface Statement {
  bind(...values: (string | number)[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[]; success: boolean }>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<unknown[]>;
}
export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DB?: Database;
  ANALYTICS_OWNER_EMAIL?: string;
}
export function database(env: Env): Database {
  if (!env.DB) throw new Error("Analytics database unavailable");
  return env.DB;
}
