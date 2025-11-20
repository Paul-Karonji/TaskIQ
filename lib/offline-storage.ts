// Offline Task Storage using IndexedDB
// Stores tasks created while offline and syncs when back online

const DB_NAME = 'duesync-offline';
const DB_VERSION = 1;
const STORE_NAME = 'pending-tasks';

export interface OfflineTask {
  id: string; // Temporary ID
  title: string;
  description?: string;
  dueDate: string;
  dueTime?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  categoryId?: string;
  estimatedTime?: number;
  isRecurring?: boolean;
  recurringPattern?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'failed';
  retryCount: number;
}

/**
 * Open IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
}

/**
 * Save a task to offline storage
 */
export async function saveOfflineTask(task: Omit<OfflineTask, 'id' | 'createdAt' | 'syncStatus' | 'retryCount'>): Promise<string> {
  const db = await openDatabase();

  const offlineTask: OfflineTask = {
    ...task,
    id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(offlineTask);

    request.onsuccess = () => resolve(offlineTask.id);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all pending offline tasks
 */
export async function getPendingOfflineTasks(): Promise<OfflineTask[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('syncStatus');
    const request = index.getAll('pending');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Get all offline tasks (any status)
 */
export async function getAllOfflineTasks(): Promise<OfflineTask[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Update an offline task
 */
export async function updateOfflineTask(id: string, updates: Partial<OfflineTask>): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const task = getRequest.result;
      if (task) {
        const updatedTask = { ...task, ...updates };
        const putRequest = store.put(updatedTask);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error('Task not found'));
      }
    };

    getRequest.onerror = () => reject(getRequest.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Delete an offline task
 */
export async function deleteOfflineTask(id: string): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => db.close();
  });
}

/**
 * Clear all synced tasks (cleanup)
 */
export async function clearSyncedTasks(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('syncStatus');

    const request = index.openCursor(IDBKeyRange.only('pending'));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        // Skip - only delete non-pending
        cursor.continue();
      }
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
}

/**
 * Sync offline tasks to server
 */
export async function syncOfflineTasks(): Promise<{ success: number; failed: number }> {
  const tasks = await getPendingOfflineTasks();

  let success = 0;
  let failed = 0;

  for (const task of tasks) {
    try {
      // Update status to syncing
      await updateOfflineTask(task.id, { syncStatus: 'syncing' });

      // Send to server
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          dueTime: task.dueTime,
          priority: task.priority,
          categoryId: task.categoryId,
          estimatedTime: task.estimatedTime,
          isRecurring: task.isRecurring,
          recurringPattern: task.recurringPattern,
        }),
      });

      if (response.ok) {
        // Successfully synced - delete from offline storage
        await deleteOfflineTask(task.id);
        success++;
      } else {
        // Failed - mark as failed and increment retry count
        await updateOfflineTask(task.id, {
          syncStatus: 'failed',
          retryCount: task.retryCount + 1,
        });
        failed++;
      }
    } catch (error) {
      console.error('[Offline Sync] Error syncing task:', error);
      // Mark as failed
      await updateOfflineTask(task.id, {
        syncStatus: 'failed',
        retryCount: task.retryCount + 1,
      });
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Check if browser supports necessary APIs
 */
export function isOfflineModeSupported(): boolean {
  return typeof indexedDB !== 'undefined' && 'serviceWorker' in navigator;
}

/**
 * Get offline task count
 */
export async function getOfflineTaskCount(): Promise<number> {
  const tasks = await getPendingOfflineTasks();
  return tasks.length;
}
