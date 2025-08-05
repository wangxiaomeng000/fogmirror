import { v4 as uuidv4 } from 'uuid';

interface MockSession {
  _id: string;
  userId?: string;
  title: string;
  messages: any[];
  layerData: any[];
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<void>;
}

class MockSessionStorage {
  private sessions: Map<string, MockSession> = new Map();

  create(data: { userId?: string; title: string; messages: any[]; layerData: any[] }): MockSession {
    const session: MockSession = {
      _id: uuidv4(),
      userId: data.userId,
      title: data.title,
      messages: data.messages || [],
      layerData: data.layerData || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      save: async () => {
        session.updatedAt = new Date();
        this.sessions.set(session._id, session);
      }
    };
    
    this.sessions.set(session._id, session);
    return session;
  }

  findById(id: string): MockSession | null {
    return this.sessions.get(id) || null;
  }

  findAll(): MockSession[] {
    return Array.from(this.sessions.values());
  }

  save(session: MockSession): void {
    session.updatedAt = new Date();
    this.sessions.set(session._id, session);
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  clear(): void {
    this.sessions.clear();
  }
}

export const mockSessionStorage = new MockSessionStorage();