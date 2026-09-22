"use client";

import { useEffect, useMemo } from "react";
import { inferCartesianScale } from "./scales.js";
import { numberValue } from "./utils.js";
import type { CartesianScaleType, ChartDatum, ChartDiagnostic } from "./types.js";

type DiagnosticOptions<T extends ChartDatum> = {
  chart: string;
  data: T[];
  numericKeys?: string[];
  structuralKeys?: string[];
  xKey?: string;
  xType?: CartesianScaleType;
  onDiagnostic?: (diagnostic: ChartDiagnostic) => void;
};

function summarize<T extends ChartDatum>({ chart, data, numericKeys = [], structuralKeys = [], xKey, xType = "auto" }: DiagnosticOptions<T>) {
  const diagnostics: ChartDiagnostic[] = [];
  for (const dataKey of numericKeys) {
    const missing: number[] = [];
    const invalid: number[] = [];
    data.forEach((row, index) => {
      const raw = row[dataKey];
      if (raw === null || raw === undefined || raw === "") missing.push(index);
      else if (numberValue(raw) === null) invalid.push(index);
    });
    if (missing.length) diagnostics.push({ code: "missing-number", chart, dataKey, count: missing.length, rowIndices: missing.slice(0, 8), message: `${chart}: ${missing.length} row${missing.length === 1 ? "" : "s"} are missing a numeric value for “${dataKey}”.` });
    if (invalid.length) diagnostics.push({ code: "invalid-number", chart, dataKey, count: invalid.length, rowIndices: invalid.slice(0, 8), message: `${chart}: ${invalid.length} row${invalid.length === 1 ? "" : "s"} contain a non-finite value for “${dataKey}”.` });
  }
  for (const dataKey of structuralKeys) {
    const invalid = data.flatMap((row, index) => {
      const value = row[dataKey];
      return value === null || value === undefined || (typeof value === "string" && value.trim() === "") ? [index] : [];
    });
    if (invalid.length) diagnostics.push({ code: "invalid-category", chart, dataKey, count: invalid.length, rowIndices: invalid.slice(0, 8), message: `${chart}: ${invalid.length} row${invalid.length === 1 ? "" : "s"} have an empty structural value for “${dataKey}”.` });
  }
  if (xKey) {
    const inferredType = inferCartesianScale(data.map((row) => row[xKey]), xType);
    const invalid = data.flatMap((row, index) => {
      const value = row[xKey];
      if (value === null || value === undefined || value === "") return [index];
      if (inferredType === "linear" && numberValue(value) === null) return [index];
      if (inferredType === "time") {
        const date = value instanceof Date ? value : new Date(value as string | number);
        if (!Number.isFinite(date.getTime())) return [index];
      }
      return [];
    });
    if (invalid.length) diagnostics.push({ code: "invalid-x", chart, dataKey: xKey, count: invalid.length, rowIndices: invalid.slice(0, 8), message: `${chart}: ${invalid.length} row${invalid.length === 1 ? "" : "s"} cannot be placed on the ${inferredType} x-axis “${xKey}”.` });
  }
  return diagnostics;
}

export function useChartDiagnostics<T extends ChartDatum>(options: DiagnosticOptions<T>) {
  const { chart, data, numericKeys = [], structuralKeys = [], xKey, xType, onDiagnostic } = options;
  const numericSignature = numericKeys.join("\u0000");
  const structuralSignature = structuralKeys.join("\u0000");
  const diagnostics = useMemo(() => summarize({ chart, data, numericKeys: numericSignature ? numericSignature.split("\u0000") : [], structuralKeys: structuralSignature ? structuralSignature.split("\u0000") : [], xKey, xType }), [chart, data, numericSignature, structuralSignature, xKey, xType]);
  useEffect(() => {
    diagnostics.forEach((diagnostic) => {
      onDiagnostic?.(diagnostic);
      if (process.env.NODE_ENV !== "production") console.warn(`[Generative Charts] ${diagnostic.message}`, diagnostic);
    });
  }, [diagnostics, onDiagnostic]);
  return diagnostics;
}
