// グローバル型定義

declare global {
  interface Window {
    requestIdleCallback: (
      callback: (deadline: IdleDeadline) => void,
      options?: IdleRequestOptions
    ) => number;
    cancelIdleCallback: (id: number) => void;
  }

  interface IdleDeadline {
    didTimeout: boolean;
    timeRemaining(): number;
  }

  interface IdleRequestOptions {
    timeout?: number;
  }
}

export {};