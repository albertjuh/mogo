"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { errorEmitter, DbPermissionError } from "./error-emitter";

// See use-table.tsx: the shared Supabase client's Realtime channel registry
// needs a unique topic per subscription, even across Strict Mode's
// mount/cleanup/mount on the same hook instance.
let channelCounter = 0;

/**
 * Loads a single row by id and keeps it live via realtime -- the Supabase
 * equivalent of the old Firestore useDoc()/onSnapshot(docRef) hook.
 */
export function useRow<Row, Out>(
  table: string | null,
  id: string | null | undefined,
  mapRow: (row: Row) => Out,
  select = "*",
  idColumn = "id"
): { data: Out | null; isLoading: boolean; error: Error | null } {
  const [row, setRow] = useState<Row | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!table || !id) {
      setRow(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function run() {
      const { data, error } = await supabase.from(table!).select(select).eq(idColumn, id).maybeSingle();
      if (cancelled) return;
      if (error) {
        setError(new Error(error.message));
        errorEmitter.emit(new DbPermissionError(table!, "select", error.message));
        setRow(null);
      } else {
        setRow(data as Row);
        setError(null);
      }
      setIsLoading(false);
    }

    run();

    const channel = supabase
      .channel(`row:${table}:${idColumn}:${id}:${channelCounter++}`)
      .on("postgres_changes", { event: "*", schema: "public", table, filter: `${idColumn}=eq.${id}` }, () => run())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, id, idColumn]);

  const data = useMemo(() => (row ? mapRow(row) : null), [row]);

  return { data, isLoading, error };
}
