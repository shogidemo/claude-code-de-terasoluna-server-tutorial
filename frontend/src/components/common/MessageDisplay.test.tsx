import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TodoProvider } from '../../context/TodoContext';
import { MessageDisplay } from './MessageDisplay';

// MessageDisplayのテスト用にコンテキストをモック
const renderWithMessages = (messages: any[]) => {
  const TestComponent = () => {
    const { addTodo } = require('../../context/TodoContext').useTodo();
    
    // テスト用にメッセージを設定
    React.useEffect(() => {
      messages.forEach(msg => {
        // メッセージを手動で設定するためのテストヘルパー
      });
    }, []);
    
    return <MessageDisplay />;
  };

  return render(
    <TodoProvider>
      <TestComponent />
    </TodoProvider>
  );
};

describe('MessageDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should not render when no messages exist', () => {
    render(
      <TodoProvider>
        <MessageDisplay />
      </TodoProvider>
    );
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render success message with correct styling', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        addTodo('Test TODO');
      }, [addTodo]);
      
      return <MessageDisplay />;
    };

    render(
      <TodoProvider>
        <TestWrapper />
      </TodoProvider>
    );

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass('alert-success');
      expect(alert).toHaveTextContent('TODOを作成しました。');
    });
  });

  it('should render error message with correct styling', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        // 5件のTODOを追加して6件目でエラーを発生させる
        for (let i = 0; i < 6; i++) {
          addTodo(`Test TODO ${i + 1}`);
        }
      }, [addTodo]);
      
      return <MessageDisplay />;
    };

    render(
      <TodoProvider>
        <TestWrapper />
      </TodoProvider>
    );

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      const errorAlert = alerts.find(alert => alert.classList.contains('alert-error'));
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('未完了のTODOは最大5件までです。');
    });
  });

  it('should auto-dismiss success messages after 3 seconds', async () => {
    const TestWrapper = () => {
      const { addTodo } = require('../../context/TodoContext').useTodo();
      
      React.useEffect(() => {
        addTodo('Test TODO');
      }, [addTodo]);
      
      return <MessageDisplay />;
    };

    render(
      <TodoProvider>
        <TestWrapper />
      </TodoProvider>
    );

    // メッセージが表示されることを確認
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // 3秒後にメッセージが消えることを確認
    vi.advanceTimersByTime(3000);
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});