import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodoProvider } from '../../context/TodoContext';
import { TodoList } from './TodoList';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TodoProvider>
      {component}
    </TodoProvider>
  );
};

describe('TodoList', () => {
  it('should display empty state message when no todos exist', () => {
    renderWithProvider(<TodoList />);
    
    expect(screen.getByText('TODOがありません。上のフォームから新しいTODOを追加してください。')).toBeInTheDocument();
    expect(screen.queryByText('TODO一覧')).not.toBeInTheDocument();
  });

  it('should display todo list header when todos exist', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        addTodo('Test TODO 1');
        addTodo('Test TODO 2');
      }, [addTodo]);
      
      return <TodoList />;
    };

    renderWithProvider(<TestWrapper />);

    await screen.findByText('TODO一覧');
    expect(screen.getByText('TODO一覧')).toBeInTheDocument();
    expect(screen.queryByText('TODOがありません。上のフォームから新しいTODOを追加してください。')).not.toBeInTheDocument();
  });

  it('should render TodoItem components for each todo', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        addTodo('Test TODO 1');
        addTodo('Test TODO 2');
        addTodo('Test TODO 3');
      }, [addTodo]);
      
      return <TodoList />;
    };

    renderWithProvider(<TestWrapper />);

    await screen.findByText('Test TODO 1');
    expect(screen.getByText('Test TODO 1')).toBeInTheDocument();
    expect(screen.getByText('Test TODO 2')).toBeInTheDocument();
    expect(screen.getByText('Test TODO 3')).toBeInTheDocument();
    
    // 各TODOに対して完了ボタンと削除ボタンが表示されることを確認
    const finishButtons = screen.getAllByText('完了');
    const deleteButtons = screen.getAllByText('削除');
    expect(finishButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);
  });

  it('should display todos in correct order (newest first)', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        addTodo('First TODO');
        setTimeout(() => addTodo('Second TODO'), 10);
        setTimeout(() => addTodo('Third TODO'), 20);
      }, [addTodo]);
      
      return <TodoList />;
    };

    renderWithProvider(<TestWrapper />);

    await screen.findByText('Third TODO');
    
    const todoItems = screen.getAllByText(/TODO/);
    const todoTitles = todoItems.filter(item => 
      item.textContent?.includes('First') || 
      item.textContent?.includes('Second') || 
      item.textContent?.includes('Third')
    );
    
    // 最新のTODOが最初に表示されることを確認
    expect(todoTitles[0]).toHaveTextContent('Third TODO');
  });
});