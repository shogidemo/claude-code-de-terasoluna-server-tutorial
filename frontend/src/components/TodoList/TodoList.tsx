import React from 'react';
import { useTodo } from '../../context/TodoContext';
import { TodoItem } from '../TodoItem/TodoItem';
import './TodoList.css';

export const TodoList: React.FC = () => {
  const { todos } = useTodo();

  if (todos.length === 0) {
    return (
      <div className="no-todos">
        TODOがありません。上のフォームから新しいTODOを追加してください。
      </div>
    );
  }

  return (
    <div className="todo-list-container">
      <h3>TODO一覧</h3>
      <ul className="todo-list">
        {todos.map(todo => (
          <TodoItem key={todo.todoId} todo={todo} />
        ))}
      </ul>
    </div>
  );
};