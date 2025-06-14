export interface Todo {
  todoId: string;
  todoTitle: string;
  finished: boolean;
  createdAt: Date;
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
}

export const MAX_UNFINISHED_TODOS = 5;
export const MIN_TODO_TITLE_LENGTH = 1;
export const MAX_TODO_TITLE_LENGTH = 30;