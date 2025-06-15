import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  AppError,
  ValidationError,
  BusinessLogicError,
  StorageError,
  ErrorHandler,
  ErrorType,
  withErrorHandling,
} from '../errorHandler';

// Crypto API モック
Object.defineProperty(globalThis, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'mocked-uuid-1234'),
  },
  writable: true,
});

// Window モック
Object.defineProperty(globalThis, 'window', {
  value: {
    addEventListener: vi.fn(),
  },
  writable: true,
});

// Logger のモック
vi.mock('../logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Error Handler Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.code).toBe(ErrorType.UNKNOWN);
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with custom values', () => {
      const context = { userId: '123' };
      const error = new AppError('Test error', ErrorType.VALIDATION, 'CUSTOM_CODE', context);
      
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.context).toEqual(context);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input', 'email');
      
      expect(error.name).toBe('ValidationError');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toEqual({ field: 'email' });
    });
  });

  describe('BusinessLogicError', () => {
    it('should create BusinessLogicError', () => {
      const error = new BusinessLogicError('Business rule violated', 'BL001');
      
      expect(error.name).toBe('BusinessLogicError');
      expect(error.type).toBe(ErrorType.BUSINESS_LOGIC);
      expect(error.code).toBe('BL001');
    });

    it('should use default code when not provided', () => {
      const error = new BusinessLogicError('Business rule violated');
      
      expect(error.code).toBe('BUSINESS_ERROR');
    });
  });

  describe('StorageError', () => {
    it('should create StorageError', () => {
      const error = new StorageError('Storage failed', 'save');
      
      expect(error.name).toBe('StorageError');
      expect(error.type).toBe(ErrorType.STORAGE);
      expect(error.code).toBe('STORAGE_ERROR');
      expect(error.context).toEqual({ operation: 'save' });
    });
  });

  describe('ErrorHandler.handleError', () => {
    it('should handle AppError', () => {
      const appError = new AppError('App error', ErrorType.VALIDATION, 'VAL001');
      const result = ErrorHandler.handleError(appError);
      
      expect(result.type).toBe('error');
      expect(result.text).toBe('App error');
      expect(result.id).toBeDefined();
    });

    it('should handle standard Error', () => {
      const standardError = new Error('Standard error');
      const result = ErrorHandler.handleError(standardError);
      
      expect(result.type).toBe('error');
      expect(result.text).toBe('予期しないエラーが発生しました。しばらく経ってから再度お試しください。');
      expect(result.id).toBeDefined();
    });

    it('should handle unknown errors', () => {
      const unknownError = 'String error';
      const result = ErrorHandler.handleError(unknownError);
      
      expect(result.type).toBe('error');
      expect(result.text).toBe('予期しないエラーが発生しました。しばらく経ってから再度お試しください。');
      expect(result.id).toBeDefined();
    });

    it('should provide user-friendly messages for different error types', () => {
      const testCases = [
        {
          error: new AppError('Storage failed', ErrorType.STORAGE),
          expectedMessage: 'データの保存中にエラーが発生しました。しばらく経ってから再度お試しください。',
        },
        {
          error: new AppError('Network failed', ErrorType.NETWORK),
          expectedMessage: 'ネットワークエラーが発生しました。接続を確認してください。',
        },
        {
          error: new ValidationError('Invalid input'),
          expectedMessage: 'Invalid input',
        },
        {
          error: new BusinessLogicError('Business rule violated'),
          expectedMessage: 'Business rule violated',
        },
      ];

      testCases.forEach(({ error, expectedMessage }) => {
        const result = ErrorHandler.handleError(error);
        expect(result.text).toBe(expectedMessage);
      });
    });
  });

  describe('ErrorHandler.setupGlobalErrorHandlers', () => {
    it('should setup global error handlers', () => {
      ErrorHandler.setupGlobalErrorHandlers();
      
      expect(globalThis.window.addEventListener).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(globalThis.window.addEventListener).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('withErrorHandling', () => {
    it('should wrap function with error handling', () => {
      const testFunction = vi.fn(() => 'success');
      const wrappedFunction = withErrorHandling(testFunction, 'test context');
      
      const result = wrappedFunction();
      
      expect(result).toBe('success');
      expect(testFunction).toHaveBeenCalled();
    });

    it('should catch and wrap synchronous errors', () => {
      const testFunction = vi.fn(() => {
        throw new Error('Test error');
      });
      const wrappedFunction = withErrorHandling(testFunction, 'test context');
      
      expect(() => wrappedFunction()).toThrow(AppError);
    });

    it('should handle Promise rejections', async () => {
      const testFunction = vi.fn(() => Promise.reject(new Error('Async error')));
      const wrappedFunction = withErrorHandling(testFunction, 'test context');
      
      await expect(wrappedFunction()).rejects.toThrow(AppError);
    });

    it('should handle successful Promise returns', async () => {
      const testFunction = vi.fn(() => Promise.resolve('async success'));
      const wrappedFunction = withErrorHandling(testFunction, 'test context');
      
      const result = await wrappedFunction();
      expect(result).toBe('async success');
    });

    it('should preserve function arguments', () => {
      const testFunction = vi.fn((a: number, b: string) => `${a}-${b}`);
      const wrappedFunction = withErrorHandling(testFunction);
      
      const result = wrappedFunction(42, 'test');
      
      expect(result).toBe('42-test');
      expect(testFunction).toHaveBeenCalledWith(42, 'test');
    });

    it('should use function name when context is not provided', () => {
      function namedFunction() {
        throw new Error('Test error');
      }
      
      const wrappedFunction = withErrorHandling(namedFunction);
      
      expect(() => wrappedFunction()).toThrow(AppError);
    });
  });
});