import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadTodosFromStorage, saveTodosToStorage, clearCorruptedStorage } from '../storage';
import type { Todo } from '../../types/todo';

// LocalStorage モック
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Global objects setup
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// requestIdleCallback モック
Object.defineProperty(globalThis, 'requestIdleCallback', {
  value: vi.fn((callback) => {
    callback({ didTimeout: false, timeRemaining: () => 50 });
    return 1;
  }),
  writable: true,
});

describe('Storage Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadTodosFromStorage', () => {
    it('should load valid todos from storage', () => {
      const storedTodos = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedTodos));

      const result = loadTodosFromStorage();

      expect(result).toHaveLength(1);
      expect(result![0].todoId).toBe('1');
      expect(result![0].todoTitle).toBe('Test TODO');
      expect(result![0].createdAt).toBeInstanceOf(Date);
    });

    it('should return empty array when no data in storage', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = loadTodosFromStorage();

      expect(result).toEqual([]);
    });

    it('should return null for corrupted data', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');

      const result = loadTodosFromStorage();

      expect(result).toBeNull();
    });

    it('should filter out invalid todo items', () => {
      const mixedData = [
        {
          todoId: '1',
          todoTitle: 'Valid TODO',
          finished: false,
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          // Missing required fields
          todoId: '2',
        },
        'invalid item',
        null,
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mixedData));

      const result = loadTodosFromStorage();

      expect(result).toHaveLength(1);
      expect(result![0].todoId).toBe('1');
    });

    it('should return null for non-array data', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ not: 'array' }));

      const result = loadTodosFromStorage();

      expect(result).toBeNull();
    });

    it('should handle invalid date strings', () => {
      const todoWithInvalidDate = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: 'invalid date',
        },
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(todoWithInvalidDate));

      const result = loadTodosFromStorage();

      expect(result).toEqual([]);
    });
  });

  describe('saveTodosToStorage', () => {
    it('should save todos to storage using requestIdleCallback', () => {
      const todos: Todo[] = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ];

      saveTodosToStorage(todos);

      expect(globalThis.requestIdleCallback).toHaveBeenCalled();
      
      // requestIdleCallback コールバックを実行
      const callback = (globalThis.requestIdleCallback as any).mock.calls[0][0];
      callback({ didTimeout: false, timeRemaining: () => 50 });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'react-todo-app-todos',
        expect.stringContaining('"todoId":"1"')
      );
    });

    it('should fallback to setTimeout when requestIdleCallback is not available', () => {
      // requestIdleCallback を一時的に削除
      const originalRequestIdleCallback = globalThis.requestIdleCallback;
      delete (globalThis as any).requestIdleCallback;

      const todos: Todo[] = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ];

      // setTimeout をモック
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        callback();
        return 1 as any;
      });

      saveTodosToStorage(todos);

      expect(setTimeoutSpy).toHaveBeenCalled();
      expect(localStorageMock.setItem).toHaveBeenCalled();

      // 元に戻す
      globalThis.requestIdleCallback = originalRequestIdleCallback;
      setTimeoutSpy.mockRestore();
    });

    it('should convert Date objects to ISO strings', () => {
      const todos: Todo[] = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: new Date('2023-01-01T00:00:00.000Z'),
        },
      ];

      saveTodosToStorage(todos);

      // requestIdleCallback コールバックを実行
      const callback = (globalThis.requestIdleCallback as any).mock.calls[0][0];
      callback({ didTimeout: false, timeRemaining: () => 50 });

      const savedData = localStorageMock.setItem.mock.calls[0][1];
      const parsedData = JSON.parse(savedData);
      
      expect(parsedData[0].createdAt).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should handle storage errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const todos: Todo[] = [
        {
          todoId: '1',
          todoTitle: 'Test TODO',
          finished: false,
          createdAt: new Date(),
        },
      ];

      expect(() => saveTodosToStorage(todos)).not.toThrow();
      
      // requestIdleCallback コールバックを実行
      const callback = (globalThis.requestIdleCallback as any).mock.calls[0][0];
      callback({ didTimeout: false, timeRemaining: () => 50 });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save todos to localStorage:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearCorruptedStorage', () => {
    it('should remove data from storage', () => {
      clearCorruptedStorage();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('react-todo-app-todos');
    });

    it('should handle removal errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => clearCorruptedStorage()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});