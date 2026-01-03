import { ShadowEntry } from '../types';

export class ShadowCore {
  private log: ShadowEntry[] = [];

  public logEntry(entry: ShadowEntry): void {
    console.log(`[SHADOW] Logging entry ${entry.id} (${entry.cycle.trigger} -> ${entry.cycle.new_frame})`);
    this.log.push(entry);
  }

  public getRecentEntries(limit: number = 5): ShadowEntry[] {
    return this.log.slice(-limit);
  }
}
