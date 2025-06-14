import React from 'react';
import { Todo } from '../../types/todo';
import { useTodo } from '../../context/TodoContext';
import './TodoItem.css';

interface TodoItemProps {
  todo: Todo;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { finishTodo, deleteTodo } = useTodo();

  const handleFinish = () => {
    finishTodo(todo.todoId);
  };

  const handleDelete = () => {
    if (window.confirm('本当に削除しますか？')) {
      deleteTodo(todo.todoId);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <li className={`todo-item ${todo.finished ? 'finished' : ''}`}>
      <div className="todo-content">
        <div className="todo-title">{todo.todoTitle}</div>
        <div className="todo-date">{formatDate(todo.createdAt)}</div>
      </div>
      <div className="todo-actions">
        {!todo.finished && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleFinish}
          >
            完了
          </button>
        )}
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
        >
          削除
        </button>
      </div>
    </li>
  );
};