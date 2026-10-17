/** Small, session-only cache. Never persisted to browser storage or the service worker. */
export class SpeechCache {
  private entries = new Map<string, Blob>();
  private bytes = 0;

  constructor(
    private maxBytes = 8 * 1024 * 1024,
    private maxEntries = 5,
  ) {}

  get(key: string) {
    const value = this.entries.get(key);
    if (value) {
      this.entries.delete(key);
      this.entries.set(key, value);
    }
    return value;
  }

  set(key: string, value: Blob) {
    const previous = this.entries.get(key);
    if (previous) {
      this.bytes -= previous.size;
      this.entries.delete(key);
    }
    if (value.size > this.maxBytes) return;
    this.entries.set(key, value);
    this.bytes += value.size;
    while (this.bytes > this.maxBytes || this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value;
      if (oldest === undefined) break;
      this.bytes -= this.entries.get(oldest)!.size;
      this.entries.delete(oldest);
    }
  }

  clear() {
    this.entries.clear();
    this.bytes = 0;
  }
}
