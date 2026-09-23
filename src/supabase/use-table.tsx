"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorEmitter, DbPermissionError } from "./error-emitter";

export interface TableFilter {
  column: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: string | number | boolean;
}

export interface TableQuery {
  table: string;
  select?: string;
  filters?: TableFilter[];
  order?: { column: string; ascending?: boolean };
}

/**
 * Loads rows from a table (optionally filtered/ordered) and keeps them live
 * via a Postgres realtime subscription -- the Supabase equivalent of the old
 * Firestore useCollection()/onSnapshot() hook.
 */
export function useTable<Row, Out>(
  query: TableQuery | null,
  mapRow: (row: Row) => Out
): { data: Out[] | null; isLoading: boolean; error: Error | null } {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const key = query ? JSON.stringify(query) : null;

  useEffect(() => {
    if (!query) {
      setRows(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function run() {
      let q: any = supabase.from(query!.table).select(query!.select || "*");
      for (const f of query!.filters || []) {
        q = q[f.op](f.column, f.value);
      }
      if (query!.order) {
        q = q.order(query!.order.column, { ascending: query!.order.ascending ?? true });
      }
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        setError(new Error(error.message));
        errorEmitter.emit(new DbPermissionError(query!.table, "select", error.message));
        setRows(null);
      } else {
        setRows(data);
        setError(null);
      }
      setIsLoading(false);
    }

    run();

    const channel = supabase
      .channel(`table:${query.table}:${key}`)
      .on("postgres_changes", { event: "*", schema: "public", table: query.table }, () => run())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const data = useMemo(() => (rows ? rows.map(mapRow) : null), [rows]);

  return { data, isLoading, error };
}
