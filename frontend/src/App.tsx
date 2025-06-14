import React from 'react';
import { TodoProvider } from './context/TodoContext';
import { TodoForm } from './components/TodoForm/TodoForm';
import { TodoList } from './components/TodoList/TodoList';
import { MessageDisplay } from './components/common/MessageDisplay';
import './App.css';

function App() {
  return (
    <TodoProvider>
      <div className="app">
        <div className="container">
          <h1>TODO List</h1>
          <MessageDisplay />
          <TodoForm />
          <TodoList />
        </div>
      </div>
    </TodoProvider>
  );
}

export default App;
