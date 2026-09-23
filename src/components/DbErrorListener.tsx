"use client";

import { useState, useEffect } from "react";
import { errorEmitter, DbPermissionError } from "@/supabase/error-emitter";

/** Invisible component: rethrows globally-emitted RLS permission errors so Next.js's error boundary surfaces them. */
export function DbErrorListener() {
  const [error, setError] = useState<DbPermissionError | null>(null);

  useEffect(() => {
    errorEmitter.on(setError);
    return () => errorEmitter.off(setError);
  }, []);

  if (error) throw error;
  return null;
}
