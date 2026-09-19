import React from 'react';

const AIChatButton = ({ onClick, isOpen }) => {
  return (
    <button
      type="button"
      className="ai-chat-button"
      onClick={onClick}
      aria-label={isOpen ? 'Đóng trợ lý AI' : 'Mở trợ lý AI'}
      title="Trợ lý AI Huỳnh Gia"
    >
      {isOpen ? '×' : 'AI'}
    </button>
  );
};

export default AIChatButton;