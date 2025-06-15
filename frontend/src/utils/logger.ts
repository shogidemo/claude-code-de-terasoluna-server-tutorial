// ログレベル定義
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// ログエントリの型定義
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  error?: Error;
}

// ログ設定
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxStorageEntries: number;
}

class Logger {
  private config: LoggerConfig;
  private readonly STORAGE_KEY = 'react-todo-app-logs';

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableConsole: true,
      enableStorage: false,
      maxStorageEntries: 100,
      ...config,
    };
  }

  /**
   * デバッグログを出力
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * 情報ログを出力
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * 警告ログを出力
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * エラーログを出力
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * ログエントリを記録
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    };

    if (this.config.enableConsole) {
      this.logToConsole(entry);
    }

    if (this.config.enableStorage) {
      this.logToStorage(entry);
    }
  }

  /**
   * コンソールにログを出力
   */
  private logToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${LogLevel[entry.level]}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context, entry.error);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context);
        break;
      case LogLevel.ERROR:
        console.error(message, entry.context, entry.error);
        break;
    }
  }

  /**
   * ローカルストレージにログを保存
   */
  private logToStorage(entry: LogEntry): void {
    try {
      const logs = this.getStoredLogs();
      logs.push({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
        error: entry.error ? {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        } : undefined,
      });

      // 最大保存数を超えた場合は古いログを削除
      if (logs.length > this.config.maxStorageEntries) {
        logs.splice(0, logs.length - this.config.maxStorageEntries);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to store log entry:', error);
    }
  }

  /**
   * ストレージからログを取得
   */
  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to retrieve stored logs:', error);
      return [];
    }
  }

  /**
   * 保存されたログをクリア
   */
  clearLogs(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// 環境に応じたデフォルト設定
const isDevelopment = import.meta.env.DEV;

export const logger = new Logger({
  level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableStorage: isDevelopment,
  maxStorageEntries: 100,
});

export default logger;