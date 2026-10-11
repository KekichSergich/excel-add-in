import type { Session } from "./interfaces/session-interface.js";

export class SessionStore {
  private readonly sessions = new Map<string, Session>();
  
  add(id: string, session: Session): void {
    this.sessions.set(id, session);
  }

  get(id:string): Session | undefined {
    return this.sessions.get(id);
  }

  delete(id:string): boolean {
    return this.sessions.delete(id);
  }

  get size(): number {
    return this.sessions.size;
  }
  touch(id:string): Session | undefined {
    let session = this.sessions.get(id);
    if (session) {
      session.lastSeenAt = Date.now();
    } else {
      return undefined;
    }
    return session;
  }

  async sweep(ttlMs: number): Promise<number>{
    const now: number = Date.now();
    let removed: number = 0;
    const entries = this.sessions.entries();

    for (const entry of entries){
      const id: string = entry[0];
      const session: Session = entry[1];
      const idleTime: number = now - session.lastSeenAt;
      const isExpired: boolean = idleTime > ttlMs;

      if(isExpired === true){
        this.sessions.delete(id);
        await session.server.close();
        removed = removed + 1;
      }
    }

    return removed;
  }
}