"use client";

export class DbPermissionError extends Error {
  constructor(public readonly table: string, public readonly operation: string, cause: string) {
    super(`Row Level Security denied ${operation} on "${table}": ${cause}`);
    this.name = "DbPermissionError";
  }
}

type Callback = (error: DbPermissionError) => void;
const listeners: Callback[] = [];

export const errorEmitter = {
  on(callback: Callback) {
    listeners.push(callback);
  },
  off(callback: Callback) {
    const i = listeners.indexOf(callback);
    if (i >= 0) listeners.splice(i, 1);
  },
  emit(error: DbPermissionError) {
    listeners.forEach((cb) => cb(error));
  },
};
