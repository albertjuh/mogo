"use client";

import { createClient } from "@/lib/supabase/client";
import { errorEmitter, DbPermissionError } from "./error-emitter";

/** Fire-and-forget insert; on RLS/constraint failure, emits a DbPermissionError instead of throwing. */
export function insertRowNonBlocking(table: string, row: Record<string, unknown>) {
  const supabase = createClient();
  supabase
    .from(table)
    .insert(row)
    .then(({ error }) => {
      if (error) errorEmitter.emit(new DbPermissionError(table, "insert", error.message));
    });
}

export function upsertRowNonBlocking(table: string, row: Record<string, unknown>) {
  const supabase = createClient();
  supabase
    .from(table)
    .upsert(row)
    .then(({ error }) => {
      if (error) errorEmitter.emit(new DbPermissionError(table, "upsert", error.message));
    });
}

export function updateRowNonBlocking(table: string, id: string, patch: Record<string, unknown>) {
  const supabase = createClient();
  supabase
    .from(table)
    .update(patch)
    .eq("id", id)
    .then(({ error }) => {
      if (error) errorEmitter.emit(new DbPermissionError(table, "update", error.message));
    });
}

export function deleteRowNonBlocking(table: string, id: string) {
  const supabase = createClient();
  supabase
    .from(table)
    .delete()
    .eq("id", id)
    .then(({ error }) => {
      if (error) errorEmitter.emit(new DbPermissionError(table, "delete", error.message));
    });
}
