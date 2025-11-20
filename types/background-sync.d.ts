// Type definitions for Background Sync API
// https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API

interface SyncManager {
  getTags(): Promise<string[]>;
  register(tag: string): Promise<void>;
}

interface ServiceWorkerRegistration {
  readonly sync: SyncManager;
}

interface SyncEvent extends ExtendableEvent {
  readonly lastChance: boolean;
  readonly tag: string;
}

declare global {
  interface ServiceWorkerGlobalScopeEventMap {
    sync: SyncEvent;
  }
}

export {};
