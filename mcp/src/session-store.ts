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
}