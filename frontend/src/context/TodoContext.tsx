import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Todo, ResultMessage, MAX_UNFINISHED_TODOS } from '../types/todo';

interface TodoContextType {
  todos: Todo[];
  messages: ResultMessage[];
  addTodo: (title: string) => void;
  finishTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => void;
  clearMessages: () => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const STORAGE_KEY = 'react-todo-app-todos';

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [messages, setMessages] = useState<ResultMessage[]>([]);

  // LocalStorageから初期データを読み込み
  useEffect(() => {
    const storedTodos = localStorage.getItem(STORAGE_KEY);
    if (storedTodos) {
      try {
        const parsedTodos = JSON.parse(storedTodos);
        setTodos(parsedTodos.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load todos from localStorage:', error);
      }
    }
  }, []);

  // TodosをLocalStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addMessage = useCallback((message: ResultMessage) => {
    setMessages(prev => [...prev, message]);
    // 3秒後に自動的にメッセージを削除
    if (message.type === 'success') {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m !== message));
      }, 3000);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addTodo = useCallback((title: string) => {
    // 未完了TODOの数をチェック
    const unfinishedCount = todos.filter(todo => !todo.finished).length;
    if (unfinishedCount >= MAX_UNFINISHED_TODOS) {
      addMessage({
        type: 'error',
        text: `未完了のTODOは最大${MAX_UNFINISHED_TODOS}件までです。`
      });
      return;
    }

    const newTodo: Todo = {
      todoId: Date.now().toString(),
      todoTitle: title,
      finished: false,
      createdAt: new Date()
    };

    setTodos(prev => [newTodo, ...prev]);
    addMessage({
      type: 'success',
      text: 'TODOを作成しました。'
    });
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

  const value: TodoContextType = {
    todos,
    messages,
    addTodo,
    finishTodo,
    deleteTodo,
    clearMessages
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};