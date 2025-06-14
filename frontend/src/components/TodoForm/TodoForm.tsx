import React, { useState, FormEvent } from 'react';
import { useTodo } from '../../context/TodoContext';
import { MIN_TODO_TITLE_LENGTH, MAX_TODO_TITLE_LENGTH } from '../../types/todo';
import './TodoForm.css';

export const TodoForm: React.FC = () => {
  const [todoTitle, setTodoTitle] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { addTodo } = useTodo();

  const validateTitle = (title: string): string[] => {
    const errors: string[] = [];
    
    if (!title.trim()) {
      errors.push('TODOタイトルは必須です。');
    } else if (title.length < MIN_TODO_TITLE_LENGTH) {
      errors.push(`TODOタイトルは${MIN_TODO_TITLE_LENGTH}文字以上入力してください。`);
    } else if (title.length > MAX_TODO_TITLE_LENGTH) {
      errors.push(`TODOタイトルは${MAX_TODO_TITLE_LENGTH}文字以内で入力してください。`);
    }
    
    return errors;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateTitle(todoTitle);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    addTodo(todoTitle.trim());
    setTodoTitle('');
    setErrors([]);
  };

  const handleChange = (value: string) => {
    setTodoTitle(value);
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="form-section">
      <h3>新しいTODOを追加</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="todoTitle" className="form-label">
            TODOタイトル:
          </label>
          <div className="input-group">
            <input
              type="text"
              id="todoTitle"
              className={`form-input ${errors.length > 0 ? 'error' : ''}`}
              value={todoTitle}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="TODOを入力してください"
              maxLength={MAX_TODO_TITLE_LENGTH}
            />
            <button type="submit" className="btn btn-primary">
              追加
            </button>
          </div>
          <div className="form-helper">
            {todoTitle.length}/{MAX_TODO_TITLE_LENGTH}文字
          </div>
        </div>
        {errors.length > 0 && (
          <div className="errors">
            {errors.map((error, index) => (
              <div key={index} className="error-message">{error}</div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};