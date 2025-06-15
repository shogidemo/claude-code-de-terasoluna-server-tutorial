import logger from './logger';
import type { ResultMessage } from '../types/todo';

// エラー種別定義
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

// アプリケーションエラークラス
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    code?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code || type;
    this.context = context;

    // スタックトレースを正しく設定
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// バリデーションエラー
export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', { field });
    this.name = 'ValidationError';
  }
}

// ビジネスロジックエラー
export class BusinessLogicError extends AppError {
  constructor(message: string, code?: string) {
    super(message, ErrorType.BUSINESS_LOGIC, code || 'BUSINESS_ERROR');
    this.name = 'BusinessLogicError';
  }
}

// ストレージエラー
export class StorageError extends AppError {
  constructor(message: string, operation?: string) {
    super(message, ErrorType.STORAGE, 'STORAGE_ERROR', { operation });
    this.name = 'StorageError';
  }
}

/**
 * エラーハンドラー
 */
export class ErrorHandler {
  /**
   * エラーを処理してResultMessageに変換
   */
  static handleError(error: unknown): ResultMessage {
    let message: string;
    let errorType: ErrorType = ErrorType.UNKNOWN;

    if (error instanceof AppError) {
      message = error.message;
      errorType = error.type;
      
      logger.error(
        `Application error: ${error.message}`,
        error,
        {
          type: error.type,
          code: error.code,
          context: error.context,
        }
      );
    } else if (error instanceof Error) {
      message = error.message;
      logger.error(`Unexpected error: ${error.message}`, error);
    } else {
      message = 'Unknown error occurred';
      logger.error('Unknown error', undefined, { error });
    }

    return {
      id: crypto.randomUUID(),
      type: 'error',
      text: this.getUserFriendlyMessage(message, errorType),
    };
  }

  /**
   * ユーザーフレンドリーなエラーメッセージに変換
   */
  private static getUserFriendlyMessage(message: string, type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return message; // バリデーションエラーはそのまま表示
      case ErrorType.STORAGE:
        return 'データの保存中にエラーが発生しました。しばらく経ってから再度お試しください。';
      case ErrorType.BUSINESS_LOGIC:
        return message; // ビジネスロジックエラーはそのまま表示
      case ErrorType.NETWORK:
        return 'ネットワークエラーが発生しました。接続を確認してください。';
      default:
        return '予期しないエラーが発生しました。しばらく経ってから再度お試しください。';
    }
  }

  /**
   * 予期しないエラーをキャッチするグローバルハンドラーを設定
   */
  static setupGlobalErrorHandlers(): void {
    // Promise の未処理リジェクション
    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Unhandled promise rejection', event.reason);
      event.preventDefault();
    });

    // JavaScript エラー
    window.addEventListener('error', (event) => {
      logger.error(
        'Global JavaScript error',
        event.error,
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    });
  }
}

/**
 * 関数実行時のエラーハンドリングラッパー
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Promise を返す関数の場合
      if (result instanceof Promise) {
        return result.catch((error) => {
          const appError = new AppError(
            `Error in ${context || fn.name}: ${error.message}`,
            ErrorType.UNKNOWN,
            undefined,
            { originalError: error }
          );
          throw appError;
        });
      }
      
      return result;
    } catch (error) {
      const appError = new AppError(
        `Error in ${context || fn.name}: ${error instanceof Error ? error.message : String(error)}`,
        ErrorType.UNKNOWN,
        undefined,
        { originalError: error }
      );
      throw appError;
    }
  }) as T;
}