import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Todo, ResultMessage } from '../types/todo';
import { MAX_UNFINISHED_TODOS } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage, clearCorruptedStorage } from '../utils/storage';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ErrorHandler, BusinessLogicError, ValidationError } from '../utils/errorHandler';
import logger from '../utils/logger';

interface TodoContextType {
  todos: Todo[];
  messages: ResultMessage[];
  addTodo: (title: string) => void;
  finishTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  clearMessages: () => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);


export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [messages, setMessages] = useState<ResultMessage[]>([]);

  // LocalStorageから初期データを読み込み
  useEffect(() => {
    const loadedTodos = loadTodosFromStorage();
    if (loadedTodos !== null) {
      setTodos(loadedTodos);
    } else {
      // 破損したデータをクリア
      clearCorruptedStorage();
    }
  }, []);

  // TodosをLocalStorageに保存（デバウンス付き）
  const debouncedTodos = useDebouncedValue(todos, 500);
  useEffect(() => {
    if (debouncedTodos.length > 0 || todos.length === 0) {
      saveTodosToStorage(debouncedTodos);
    }
  }, [debouncedTodos, todos.length]);

  const addMessage = useCallback((message: ResultMessage | Omit<ResultMessage, 'id'>) => {
    const messageWithId: ResultMessage = 'id' in message ? message : {
      ...message,
      id: uuidv4()
    };
    setMessages(prev => [...prev, messageWithId]);
    // 3秒後に自動的にメッセージを削除
    if (messageWithId.type === 'success') {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== messageWithId.id));
      }, 3000);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addTodo = useCallback((title: string) => {
    try {
      // バリデーション
      if (!title || title.trim().length === 0) {
        throw new ValidationError('TODOタイトルは必須です。');
      }
      
      const trimmedTitle = title.trim();
      if (trimmedTitle.length > 30) {
        throw new ValidationError('TODOタイトルは30文字以内で入力してください。');
      }

      // 未完了TODOの数をチェック
      const unfinishedCount = todos.filter(todo => !todo.finished).length;
      if (unfinishedCount >= MAX_UNFINISHED_TODOS) {
        throw new BusinessLogicError(`未完了のTODOは最大${MAX_UNFINISHED_TODOS}件までです。`);
      }

      const newTodo: Todo = {
        todoId: uuidv4(),
        todoTitle: trimmedTitle,
        finished: false,
        createdAt: new Date()
      };

      setTodos(prev => [newTodo, ...prev]);
      
      const successMessage: ResultMessage = {
        id: uuidv4(),
        type: 'success',
        text: 'TODOを作成しました。'
      };
      addMessage(successMessage);
      
      logger.info('TODO created successfully', { todoId: newTodo.todoId, title: trimmedTitle });
    } catch (error) {
      const errorMessage = ErrorHandler.handleError(error);
      addMessage(errorMessage);
    }
  }, [todos, addMessage]);

  const finishTodo = useCallback((todoId: string) => {
    setTodos(prev => {
      const todo = prev.find(t => t.todoId === todoId);
      if (!todo) {
        addMessage({
          type: 'error',
          text: 'TODOが見つかりません。'
        });
        return prev;
      }

      if (todo.finished) {
        addMessage({
          type: 'error',
          text: 'このTODOは既に完了しています。'
        });
        return prev;
      }

      const updated = prev.map(t =>
        t.todoId === todoId ? { ...t, finished: true } : t
      );
      
      addMessage({
        type: 'success',
        text: 'TODOを完了しました。'
      });
      
      return updated;
    });
  }, [addMessage]);

  const deleteTodo = useCallback((todoId: string) => {
    setTodos(prev => {
      const todo = prev.find(t => t.todoId === todoId);
      if (!todo) {
        addMessage({
          type: 'error',
          text: 'TODOが見つかりません。'
        });
        return prev;
      }

      const updated = prev.filter(t => t.todoId !== todoId);
      
      addMessage({
        type: 'success',
        text: 'TODOを削除しました。'
      });
      
      return updated;
    });
  }, [addMessage]);

  const value: TodoContextType = useMemo(() => ({
    todos,
    messages,
    addTodo,
    finishTodo,
    deleteTodo,
    clearMessages
  }), [todos, messages, addTodo, finishTodo, deleteTodo, clearMessages]);

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};