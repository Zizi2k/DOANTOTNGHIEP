import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { aiService } from '../../services';
import './AIChat.css';
const AIChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Xin chào! Tôi là Trợ lý AI Huỳnh Gia. Tôi có thể hỗ trợ bạn tìm hiểu khóa học và giải đáp các thông tin học tập.',
    },
  ]);

  const bottomRef = useRef(null);

  // Tự cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [messages, loading, isOpen]);

  const sendMessage = async (customMessage = null) => {
    const text = String(
      customMessage ?? message
    ).trim();

    if (!text || loading) {
      return;
    }

    // Hiển thị câu hỏi của người dùng
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: text,
      },
    ]);

    setMessage('');
    setLoading(true);

    try {
      const response = await aiService.chat(text);

      const answer =
        response?.data?.answer ||
        'Xin lỗi, tôi chưa thể trả lời câu hỏi này.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
        },
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);

      let errorMessage =
        'Trợ lý AI hiện không thể xử lý yêu cầu. Vui lòng thử lại sau.';

      if (error?.response?.status === 401) {
        errorMessage =
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    // Enter gửi, Shift + Enter xuống dòng
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    'Trung tâm có khóa học nào?',
    'Tôi muốn học Excel',
    'Khóa học nào phù hợp cho người mới?',
  ];

  return (
    <>
      {isOpen && (
        <div className="ai-chat-window">

          {/* HEADER */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">
                AI
              </div>

              <div>
                <div className="ai-chat-title">
                  Trợ lý AI Huỳnh Gia
                </div>

                <div className="ai-chat-status">
                  <span className="ai-status-dot" />
                  Đang hoạt động
                </div>
              </div>
            </div>

            <button
              type="button"
              className="ai-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng"
            >
              ×
            </button>
          </div>

          {/* MESSAGE AREA */}
          <div className="ai-chat-messages">

            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={`ai-message-row ${
                  item.role === 'user'
                    ? 'ai-message-user-row'
                    : 'ai-message-assistant-row'
                }`}
              >
                {item.role === 'assistant' && (
                  <div className="ai-message-avatar">
                    AI
                  </div>
                )}

                <div
                  className={`ai-message ${
                    item.role === 'user'
                      ? 'ai-message-user'
                      : 'ai-message-assistant'
                  } ${
                    item.isError
                      ? 'ai-message-error'
                      : ''
                  }`}
                >
                  {item.content}
                </div>
              </div>
            ))}

            {/* LOADING */}
            {loading && (
              <div className="ai-message-row ai-message-assistant-row">

                <div className="ai-message-avatar">
                  AI
                </div>

                <div className="ai-message ai-message-assistant ai-typing">
                  <span />
                  <span />
                  <span />
                </div>

              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* QUICK QUESTIONS */}
          {messages.length <= 1 && (
            <div className="ai-quick-questions">

              <div className="ai-quick-title">
                Bạn có thể hỏi:
              </div>

              {quickQuestions.map((question) => (
                <button
                  type="button"
                  key={question}
                  onClick={() =>
                    sendMessage(question)
                  }
                  disabled={loading}
                >
                  {question}
                </button>
              ))}

            </div>
          )}

          {/* INPUT */}
          <form
            className="ai-chat-input-area"
            onSubmit={handleSubmit}
          >

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của bạn..."
              rows={1}
              maxLength={1000}
              disabled={loading}
            />

            <button
              type="submit"
              className="ai-send-button"
              disabled={
                loading || !message.trim()
              }
              title="Gửi"
            >
              ➤
            </button>

          </form>

          <div className="ai-chat-footer">
            AI có thể trả lời sai. Hãy kiểm tra thông tin quan trọng.
          </div>

        </div>
      )}

      <button
        type="button"
        className={`ai-chat-button ${
          isOpen ? 'ai-chat-button-open' : ''
        }`}
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        aria-label={
          isOpen
            ? 'Đóng trợ lý AI'
            : 'Mở trợ lý AI'
        }
      >
        {isOpen ? '×' : 'AI'}
      </button>
    </>
  );
};

export default AIChatWindow;