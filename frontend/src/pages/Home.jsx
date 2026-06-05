import { useNavigate } from 'react-router-dom';
import { useLang } from '../components/LangContext';
import { useAuth } from '../components/AuthContext';

const GREEN = '#2f6b12';
const DARK = '#153308';

const icons = ['📋', '⚙️', '🏆', '👥'];

export default function Home() {
  const { t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRole = (i) => {
    if (i === 0 || i === 1) navigate(user ? '/arena' : '/login');
    else navigate('/results');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: 'linear-gradient(135deg, #f7faf4 0%, #e8f4df 100%)',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <section
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 32,
            padding: '70px 56px',
            background: 'linear-gradient(135deg, #244f0d 0%, #4f8f22 55%, #8fbd5a 100%)',
            color: '#fff',
            boxShadow: '0 30px 70px rgba(47, 107, 18, 0.28)',
            marginBottom: 28,
          }}
        >
          <div
            style={{
              position: 'absolute',
              right: 45,
              top: 25,
              fontSize: 130,
              opacity: 0.16,
            }}
          >
            🤖
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 22,
              backdropFilter: 'blur(10px)',
            }}
          >
            <span>●</span>
            {t.hero.badge}
          </div>

          <h1
            style={{
              maxWidth: 680,
              fontSize: 52,
              lineHeight: 1.05,
              fontWeight: 800,
              margin: '0 0 16px',
              letterSpacing: '-1.5px',
            }}
          >
            {t.hero.title}
          </h1>

          <p
            style={{
              maxWidth: 620,
              fontSize: 19,
              lineHeight: 1.6,
              opacity: 0.94,
              margin: '0 0 8px',
            }}
          >
            {t.hero.sub}
          </p>

          <p
            style={{
              fontSize: 14,
              opacity: 0.8,
              marginBottom: 32,
            }}
          >
            {t.hero.date}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '15px 28px',
                background: '#fff',
                color: DARK,
                border: 'none',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 12px 30px rgba(0,0,0,0.14)',
              }}
            >
              {t.hero.btn}
            </button>

            <button
              onClick={() => navigate('/results')}
              style={{
                padding: '15px 28px',
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.28)',
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              Посмотреть результаты
            </button>
          </div>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 18,
            marginBottom: 28,
          }}
        >
          {t.roles.map((role, i) => (
            <div
              key={i}
              onClick={() => handleRole(i)}
              style={{
                background: '#fff',
                border: '1px solid #e4ecd9',
                borderRadius: 24,
                padding: 24,
                cursor: 'pointer',
                boxShadow: '0 18px 45px rgba(31, 77, 10, 0.08)',
                transition: '0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 25px 60px rgba(31, 77, 10, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 18px 45px rgba(31, 77, 10, 0.08)';
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  background: '#e9f4e3',
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  marginBottom: 18,
                }}
              >
                {icons[i]}
              </div>

              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 800,
                  margin: '0 0 8px',
                  color: DARK,
                }}
              >
                {role.title}
              </h3>

              <p
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {role.desc}
              </p>
            </div>
          ))}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
          }}
        >
          {[
            ['Live scoring', 'Оценка попыток в реальном времени'],
            ['Smart results', 'Автоматическая таблица результатов'],
            ['Admin tools', 'Панель управления турниром'],
          ].map((item) => (
            <div
              key={item[0]}
              style={{
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid #e4ecd9',
                borderRadius: 22,
                padding: 22,
                backdropFilter: 'blur(12px)',
              }}
            >
              <h4 style={{ margin: '0 0 8px', color: GREEN, fontSize: 16 }}>
                {item[0]}
              </h4>
              <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
                {item[1]}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}