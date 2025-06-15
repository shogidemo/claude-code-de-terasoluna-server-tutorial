import type { Todo, StoredTodo } from '../types/todo';

const STORAGE_KEY = 'react-todo-app-todos';

/**
 * LocalStorageからTODOデータを安全に読み込む
 * @returns TODOの配列またはnull（失敗時）
 */
export const loadTodosFromStorage = (): Todo[] | null => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      return [];
    }

    const parsedData = JSON.parse(storedData);
    
    // 配列であることを確認
    if (!Array.isArray(parsedData)) {
      console.warn('Invalid stored data format: not an array');
      return null;
    }

    // 各アイテムの型安全性を検証
    const validatedTodos: Todo[] = parsedData
      .filter((item): item is StoredTodo => isValidStoredTodo(item))
      .map((storedTodo: StoredTodo): Todo => ({
        ...storedTodo,
        createdAt: new Date(storedTodo.createdAt)
      }));

    return validatedTodos;
  } catch (error) {
    console.error('Failed to load todos from localStorage:', error);
    return null;
  }
};

/**
 * TODOデータをLocalStorageに安全に保存（非同期）
 * @param todos 保存するTODOの配列
 */
export const saveTodosToStorage = (todos: Todo[]): void => {
  try {
    const storedTodos: StoredTodo[] = todos.map((todo): StoredTodo => ({
      ...todo,
      createdAt: todo.createdAt.toISOString()
    }));

    const serializedData = JSON.stringify(storedTodos);
    
    // requestIdleCallbackがサポートされている場合は非同期で実行
    if (typeof globalThis !== 'undefined' && 'requestIdleCallback' in globalThis) {
      globalThis.requestIdleCallback(() => {
        localStorage.setItem(STORAGE_KEY, serializedData);
      });
    } else {
      // フォールバック: setTimeoutで非同期実行
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, serializedData);
      }, 0);
    }
  } catch (error) {
    console.error('Failed to save todos to localStorage:', error);
  }
};

/**
 * LocalStorageから破損したデータを削除
 */
export const clearCorruptedStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.info('Corrupted storage data cleared');
  } catch (error) {
    console.error('Failed to clear corrupted storage:', error);
  }
};

/**
 * StoredTodo型の検証
 * @param item 検証対象のオブジェクト
 * @returns StoredTodo型として有効かどうか
 */
function isValidStoredTodo(item: unknown): item is StoredTodo {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const obj = item as Record<string, unknown>;

  return (
    typeof obj.todoId === 'string' &&
    typeof obj.todoTitle === 'string' &&
    typeof obj.finished === 'boolean' &&
    typeof obj.createdAt === 'string' &&
    isValidISOString(obj.createdAt)
  );
}

/**
 * ISO日付文字列の検証
 * @param dateString 検証対象の文字列
 * @returns 有効なISO日付文字列かどうか
 */
function isValidISOString(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}