import React from 'react';
import { useTodo } from '../../context/TodoContext';
import './MessageDisplay.css';

export const MessageDisplay: React.FC = () => {
  const { messages } = useTodo();

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`alert alert-${message.type}`}
          role="alert"
        >
          {message.text}
        </div>
      ))}
    </div>
  );
};