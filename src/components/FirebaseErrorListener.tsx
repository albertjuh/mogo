"use client";

import React, { useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Error:", error.toString());
      
      const isDevelopment = process.env.NODE_ENV === "development";
      
      // In development, we throw the error to show the Next.js error overlay
      if (isDevelopment) {
        // We need to throw this in a timeout to escape the event emitter's context
        setTimeout(() => {
          throw error;
        }, 0);
      } else {
        // In production, we show a user-friendly toast
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You do not have permission to perform this action.",
        });
      }
    };

    errorEmitter.on("permission-error", handlePermissionError);

    return () => {
      errorEmitter.off("permission-error", handlePermissionError);
    };
  }, [toast]);

  return null;
}
