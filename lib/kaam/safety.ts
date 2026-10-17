import type { Source } from "./contracts";
export function officialUrl(raw: string, safety = false) {
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (!url.port || url.port === "443") &&
      (host.endsWith(".gov.in") ||
        host.endsWith(".nic.in") ||
        host === "india.gov.in" ||
        (safety &&
          ["who.int", "ilo.org"].some((d) => host === d || host.endsWith("." + d))))
    );
  } catch {
    return false;
  }
}
export function validateSourceIds(ids: string[], sources: Source[]) {
  return ids.length > 0 && ids.every((id) => sources.some((s) => s.id === id));
}
export function wav(pcm: Uint8Array, rate = 24000) {
  const bytes = new Uint8Array(44 + pcm.length);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) bytes[offset + i] = s.charCodeAt(i);
  };
  text(0, "RIFF");
  view.setUint32(4, 36 + pcm.length, true);
  text(8, "WAVE");
  text(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, pcm.length, true);
  bytes.set(pcm, 44);
  return bytes;
}
