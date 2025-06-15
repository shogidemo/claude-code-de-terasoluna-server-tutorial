import React, { useState, type FormEvent } from 'react';
import { useTodo } from '../../context/TodoContext';
import { MIN_TODO_TITLE_LENGTH, MAX_TODO_TITLE_LENGTH } from '../../types/todo';
import { validateAndSanitizeTodoTitle, comprehensiveInputValidation } from '../../utils/sanitizer';
import logger from '../../utils/logger';
import './TodoForm.css';

export const TodoForm: React.FC = () => {
  const [todoTitle, setTodoTitle] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const { addTodo } = useTodo();

  const validateTitle = (title: string): { isValid: boolean; sanitizedTitle: string; errors: string[] } => {
    // 包括的な入力検証とサニタイゼーション
    const validation = comprehensiveInputValidation(title, MAX_TODO_TITLE_LENGTH);
    
    // セキュリティ警告をログに記録
    if (validation.securityWarnings.length > 0) {
      logger.warn('Security warning in TODO title input', {
        input: title,
        warnings: validation.securityWarnings,
      });
    }
    
    // 追加の業務ルール検証
    const todoValidation = validateAndSanitizeTodoTitle(title);
    
    return {
      isValid: validation.isValid && todoValidation.isValid,
      sanitizedTitle: todoValidation.sanitizedTitle,
      errors: [...validation.errors, ...todoValidation.errors],
    };
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const validation = validateTitle(todoTitle);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // サニタイズされたタイトルを使用
    addTodo(validation.sanitizedTitle);
    setTodoTitle('');
    setErrors([]);
    
    logger.info('TODO form submitted successfully', {
      originalTitle: todoTitle,
      sanitizedTitle: validation.sanitizedTitle,
    });
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