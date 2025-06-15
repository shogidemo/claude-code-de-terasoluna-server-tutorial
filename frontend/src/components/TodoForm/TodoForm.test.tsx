import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../../context/TodoContext';
import { TodoForm } from './TodoForm';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TodoProvider>
      {component}
    </TodoProvider>
  );
};

describe('TodoForm', () => {
  it('should render form elements', () => {
    renderWithProvider(<TodoForm />);
    
    expect(screen.getByText('新しいTODOを追加')).toBeInTheDocument();
    expect(screen.getByLabelText('TODOタイトル:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('TODOを入力してください')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument();
  });

  it('should show validation error for empty input', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoForm />);
    
    const submitButton = screen.getByRole('button', { name: '追加' });
    await user.click(submitButton);
    
    expect(screen.getByText('TODOタイトルは必須です。')).toBeInTheDocument();
  });

  it('should show validation error for text too long', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoForm />);
    
    const input = screen.getByPlaceholderText('TODOを入力してください');
    const longText = 'a'.repeat(31); // 31文字（制限30文字を超過）
    
    await user.type(input, longText);
    await user.click(screen.getByRole('button', { name: '追加' }));
    
    expect(screen.getByText('TODOタイトルは30文字以内で入力してください。')).toBeInTheDocument();
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoForm />);
    
    const input = screen.getByPlaceholderText('TODOを入力してください') as HTMLInputElement;
    
    await user.type(input, 'Test TODO');
    await user.click(screen.getByRole('button', { name: '追加' }));
    
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should display character count', async () => {
    const user = userEvent.setup();
    renderWithProvider(<TodoForm />);
    
    const input = screen.getByPlaceholderText('TODOを入力してください');
    
    expect(screen.getByText('0/30文字')).toBeInTheDocument();
    
    await user.type(input, 'Hello');
    expect(screen.getByText('5/30文字')).toBeInTheDocument();
  });
});