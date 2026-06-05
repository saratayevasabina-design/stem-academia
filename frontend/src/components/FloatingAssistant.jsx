import { useState } from 'react';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';

export default function FloatingAssistant() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Здравствуйте! Я помощник STEM Academia. Чем могу помочь?',
    },
  ]);

  const askAssistant = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userQuestion,
      },
    ]);

    setQuestion('');
    setLoading(true);

    try {
      const res = await api.post('/ai/ask', {
        question: userQuestion,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.data.answer || 'Не получилось получить ответ.',
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Ошибка. Проверьте, запущен ли backend.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 90,
            width: 360,
            maxWidth: 'calc(100vw - 32px)',
            height: 520,
            maxHeight: 'calc(100vh - 120px)',
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 25px 70px rgba(0,0,0,0.22)',
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid #e5eadf',
          }}
        >
          <div
            style={{
              background: GREEN,
              color: '#fff',
              padding: '18px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 900, fontSize: 17 }}>
                🤖 AI помощник
              </div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                STEM Academia support
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.18)',
                color: '#fff',
                border: 'none',
                width: 34,
                height: 34,
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              background: '#f8fbf4',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: msg.role === 'user' ? GREEN : '#fff',
                    color: msg.role === 'user' ? '#fff' : DARK,
                    border:
                      msg.role === 'user' ? 'none' : '1px solid #e5eadf',
                    fontSize: 14,
                    lineHeight: 1.45,
                    fontWeight: 600,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  color: '#6b7280',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Помощник печатает...
              </div>
            )}
          </div>

          <form
            onSubmit={askAssistant}
            style={{
              padding: 14,
              borderTop: '1px solid #e5eadf',
              background: '#fff',
              display: 'grid',
              gridTemplateColumns: '1fr 46px',
              gap: 10,
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Напишите вопрос..."
              style={{
                border: '1px solid #dfe8d6',
                borderRadius: 14,
                padding: '12px 14px',
                outline: 'none',
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 900,
                fontSize: 17,
              }}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 62,
          height: 62,
          borderRadius: '50%',
          background: GREEN,
          color: '#fff',
          border: 'none',
          boxShadow: '0 15px 40px rgba(47,107,18,0.38)',
          zIndex: 9999,
          cursor: 'pointer',
          fontSize: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="AI помощник"
      >
        {open ? '×' : '🤖'}
      </button>
    </>
  );
}
