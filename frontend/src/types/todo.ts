export interface Todo {
  todoId: string;
  todoTitle: string;
  finished: boolean;
  createdAt: Date;
}

export interface StoredTodo {
  todoId: string;
  todoTitle: string;
  finished: boolean;
  createdAt: string; // ISO文字列形式
}

export interface TodoFormData {
  todoTitle: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ResultMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
  id: string; // メッセージの一意識別子
}

export const MAX_UNFINISHED_TODOS = 5;
export const MIN_TODO_TITLE_LENGTH = 1;
export const MAX_TODO_TITLE_LENGTH = 30;