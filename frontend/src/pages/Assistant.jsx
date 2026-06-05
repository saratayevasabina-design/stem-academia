import { useState } from 'react';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function Assistant() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Здравствуйте! Я помощник STEM Academia. Могу помочь с командами, судьями, ареной, результатами и PDF-протоколом.',
    },
  ]);
  const [loading, setLoading] = useState(false);

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
          text: 'Произошла ошибка. Проверьте, запущен ли backend.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, paddingBottom: 60 }}>
      <section
        style={{
          maxWidth: 950,
          margin: '50px auto 25px',
          background: GREEN,
          color: '#fff',
          borderRadius: 28,
          padding: '45px 55px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.16)',
            padding: '8px 14px',
            borderRadius: 20,
            marginBottom: 20,
            fontWeight: 700,
          }}
        >
          🤖 AI Assistant
        </div>

        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 900 }}>
          Помощник STEM Academia
        </h1>

        <p style={{ fontSize: 17, marginTop: 14, opacity: 0.9 }}>
          Задайте вопрос по сайту, турниру, командам, судейству или PDF-протоколу.
        </p>
      </section>

      <main
        style={{
          maxWidth: 950,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 20px 50px rgba(47,107,18,0.08)',
        }}
      >
        <div
          style={{
            height: 430,
            overflowY: 'auto',
            border: '1px solid #e5eadf',
            borderRadius: 20,
            padding: 20,
            background: '#fbfdf9',
            marginBottom: 18,
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: msg.role === 'user' ? GREEN : '#eef7e8',
                  color: msg.role === 'user' ? '#fff' : DARK,
                  fontWeight: 600,
                  lineHeight: 1.5,
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
            display: 'grid',
            gridTemplateColumns: '1fr 160px',
            gap: 12,
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Например: как скачать PDF протокол?"
            style={{
              padding: '15px 16px',
              borderRadius: 14,
              border: '1px solid #dfe8d6',
              fontSize: 15,
              outline: 'none',
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
              fontWeight: 900,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 15,
            }}
          >
            Спросить
          </button>
        </form>

        <div
          style={{
            marginTop: 18,
            color: '#6b7280',
            fontSize: 14,
          }}
        >
          Примеры вопросов: “Как добавить команду?”, “Где результаты?”, “Как скачать PDF?”, “Как добавить судью?”
        </div>
      </main>
    </div>
  );
}
