import { z } from "zod";
import {
  earningSchema,
  profileSchema,
  type Profile,
  type Earning,
  type Draft,
} from "./contracts";
export type LocalData = {
  profile: Profile | null;
  earnings: Earning[];
  drafts: Draft[];
};
export const emptyData: LocalData = { profile: null, earnings: [], drafts: [] };
const storedEarning = earningSchema.extend({ id: z.string().min(1) });
const storedDraft = z.object({
  id: z.string().min(1),
  title: z.string().max(200),
  body: z.string().max(16000),
  updatedAt: z.string().datetime(),
});
export function decodeStoredData(value: unknown): LocalData {
  if (value === undefined) return { profile: null, earnings: [], drafts: [] };
  // Reject corruption explicitly. Never silently erase or overwrite saved work.
  return z
    .object({
      profile: profileSchema.nullable(),
      earnings: z.array(storedEarning),
      drafts: z.array(storedDraft),
    })
    .parse(value);
}
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("kaam-saathi", 1);
    let blocked = false;
    req.onupgradeneeded = () => req.result.createObjectStore("data");
    req.onblocked = () => {
      blocked = true;
      reject(new Error("STORAGE"));
    };
    req.onerror = () => reject(new Error("STORAGE"));
    req.onsuccess = () => {
      if (blocked) req.result.close();
      else resolve(req.result);
    };
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest,
  decode: (value: unknown) => T,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("data", mode);
    let result: T;
    let failure: unknown;
    const fail = () => {
      db.close();
      reject(failure || new Error("STORAGE"));
    };
    tx.onerror = fail;
    tx.onabort = fail;
    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    try {
      const req = operation(tx.objectStore("data"));
      req.onsuccess = () => {
        try {
          result = decode(req.result);
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    } catch (error) {
      failure = error;
      tx.abort();
    }
  });
}
export function readData() {
  return transaction("readonly", (store) => store.get("worker"), decodeStoredData);
}
export function writeData(data: LocalData) {
  const validated = decodeStoredData(data);
  return transaction(
    "readwrite",
    (store) => store.put(validated, "worker"),
    () => undefined,
  );
}
export function clearData() {
  return transaction(
    "readwrite",
    (store) => store.clear(),
    () => undefined,
  );
}
