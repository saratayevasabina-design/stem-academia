import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthContext';
import { useLang } from '../components/LangContext';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const RED = '#a32d2d';
const TOURNAMENT_ID = '9984a68f-4e8d-414f-b57d-046c12a588a8';

const CRITERIA = [
  { key: 'cargo_full', weight: 4, isPenalty: false },
  { key: 'cargo_partial', weight: 2, isPenalty: false },
  { key: 'restart', weight: -1, isPenalty: false },
  { key: 'wrong_zone', weight: -2, isPenalty: true },
  { key: 'out_of_field', weight: -2, isPenalty: true },
  { key: 'rule_break', weight: -3, isPenalty: true },
];

function pad(n) {
  return String(n).padStart(2, '0');
}

function fmtTime(s) {
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

const counterBtn = {
  width: 34,
  height: 34,
  borderRadius: 10,
  border: '1px solid #dfe8d6',
  background: '#fff',
  cursor: 'pointer',
  fontSize: 18,
  fontWeight: 800,
  color: DARK,
};

export default function Arena() {
  const { user } = useAuth();
  const { t } = useLang();
  const a = t.arena;

  const [teams, setTeams] = useState([]);
  const [selected, setSelected] = useState(null);
  const [scores, setScores] = useState({});
  const [comment, setComment] = useState('');
  const [attempt, setAttempt] = useState(1);
  const [secs, setSecs] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const interval = useRef(null);

  useEffect(() => {
    if (!TOURNAMENT_ID) return;

    api.get(`/teams?tournament_id=${TOURNAMENT_ID}`).then((r) => {
      setTeams(r.data);
      if (r.data.length > 0) selectTeam(r.data[0]);
    });
  }, []);

  const initScores = () => {
    const s = {};
    CRITERIA.forEach((c) => {
      s[c.key] = 0;
    });
    return s;
  };

  const selectTeam = (team) => {
    setSelected(team);
    setScores(initScores());
    setComment('');
    resetTimer();
    setSubmitted(false);
  };

  const total = () =>
    Math.max(
      0,
      CRITERIA.reduce((sum, c) => sum + (scores[c.key] || 0) * c.weight, 0)
    );

  const toggleTimer = () => {
    if (running) {
      clearInterval(interval.current);
      setRunning(false);
    } else {
      setRunning(true);
      interval.current = setInterval(() => setSecs((s) => s + 1), 1000);
    }
  };

  const resetTimer = () => {
    clearInterval(interval.current);
    setRunning(false);
    setSecs(0);
  };

  const change = (key, delta) => {
    setScores((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta),
    }));
  };

  const submitScore = async () => {
    if (!selected) return;

    setSubmitting(true);

    try {
      await api.post('/attempts', {
        team_id: selected.id,
        attempt_number: attempt,
        score: total(),
        time_seconds: secs,
        comment,
        tournament_id: TOURNAMENT_ID,
        details: CRITERIA.map((c) => ({
          key: c.key,
          label: a.criteria[c.key],
          value: scores[c.key] || 0,
          weight: c.weight,
          is_penalty: c.isPenalty,
        })),
      });

      setSubmitted(true);
      resetTimer();
    } catch (err) {
      alert('Ошибка: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const pos = CRITERIA.filter((c) => !c.isPenalty);
  const neg = CRITERIA.filter((c) => c.isPenalty);

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background:
          'radial-gradient(circle at top left, #dff0d4 0%, transparent 35%), linear-gradient(135deg, #f7faf4 0%, #e8f4df 100%)',
        padding: '32px 22px',
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #244f0d, #4f8f22)',
            borderRadius: 28,
            padding: 30,
            color: '#fff',
            marginBottom: 22,
            boxShadow: '0 25px 60px rgba(47, 107, 18, 0.24)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 18,
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                gap: 8,
                alignItems: 'center',
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 999,
                padding: '7px 13px',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              ● Live arena
            </div>

            <h1 style={{ margin: 0, fontSize: 36, letterSpacing: '-1px' }}>
              Arena Scoring Panel
            </h1>

            <p style={{ margin: '8px 0 0', opacity: 0.86 }}>
              {a.day}: <b>1</b> · {a.cat}: <b>Роботек</b> · {a.table}:{' '}
              <b>#1</b>
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 20,
              padding: '16px 20px',
              textAlign: 'right',
              minWidth: 230,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8 }}>Current user</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>
              {user?.full_name || user?.username}
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
              {a.warn}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
            gap: 22,
          }}
        >
          <aside
            style={{
              background: '#fff',
              border: '1px solid #e4ecd9',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 18px 45px rgba(31, 77, 10, 0.08)',
              minHeight: 480,
            }}
          >
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid #eef2e8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: DARK }}>
                  {a.queue}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                  Teams ready for attempt
                </p>
              </div>

              <span
                style={{
                  background: '#e9f4e3',
                  color: DARK,
                  borderRadius: 999,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {teams.length}
              </span>
            </div>

            {teams.length === 0 && (
              <div style={{ padding: 26, textAlign: 'center', color: '#6b7280' }}>
                <div style={{ fontSize: 42, marginBottom: 10 }}>👥</div>
                <b>Нет команд</b>
                <p style={{ fontSize: 13 }}>
                  Добавь команды в админ-панели, чтобы они появились здесь.
                </p>
              </div>
            )}

            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => selectTeam(team)}
                style={{
                  padding: '15px 18px',
                  borderBottom: '1px solid #f2f5ef',
                  cursor: 'pointer',
                  background: selected?.id === team.id ? '#e9f4e3' : '#fff',
                  borderLeft:
                    selected?.id === team.id
                      ? `5px solid ${GREEN}`
                      : '5px solid transparent',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800, color: DARK }}>
                  {team.name}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3 }}>
                  {team.city || 'No city'}
                </div>
              </div>
            ))}
          </aside>

          <main
            style={{
              background: '#fff',
              border: '1px solid #e4ecd9',
              borderRadius: 24,
              padding: 24,
              boxShadow: '0 18px 45px rgba(31, 77, 10, 0.08)',
            }}
          >
            <div
              style={{
                background: '#f7faf4',
                border: '1px solid #e4ecd9',
                borderRadius: 22,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 900,
                  color: running ? GREEN : DARK,
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: 165,
                }}
              >
                {fmtTime(secs)}
              </div>

              <button
                onClick={toggleTimer}
                style={{
                  padding: '12px 22px',
                  background: GREEN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {running ? a.pause : a.start}
              </button>

              <button
                onClick={resetTimer}
                style={{
                  padding: '12px 18px',
                  background: '#fff',
                  color: DARK,
                  border: '1px solid #dfe8d6',
                  borderRadius: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {a.reset}
              </button>

              <span style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 13 }}>
                {a.limit}: <b>5:00</b>
              </span>

              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2].map((n) => (
                  <button
                    key={n}
                    onClick={() => setAttempt(n)}
                    style={{
                      padding: '10px 15px',
                      borderRadius: 14,
                      border: '1px solid #dfe8d6',
                      background: attempt === n ? GREEN : '#fff',
                      color: attempt === n ? '#fff' : DARK,
                      cursor: 'pointer',
                      fontWeight: 800,
                    }}
                  >
                    {a.attempt} {n}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0, color: DARK, fontSize: 24 }}>
                  {selected ? selected.name : 'Выберите команду'}
                </h2>
                <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 13 }}>
                  {selected
                    ? `${a.scoring} · Attempt ${attempt}`
                    : 'Команда пока не выбрана'}
                </p>
              </div>

              <div
                style={{
                  background: '#e9f4e3',
                  color: DARK,
                  borderRadius: 18,
                  padding: '14px 22px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>Total score</div>
                <div style={{ fontSize: 30, fontWeight: 900 }}>{total()}</div>
              </div>
            </div>

            {submitted && (
              <div
                style={{
                  background: '#ecfdf3',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  padding: '12px 14px',
                  borderRadius: 14,
                  marginBottom: 18,
                  fontWeight: 700,
                }}
              >
                ✓ {a.submitted}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 18,
                marginBottom: 18,
              }}
            >
              {[
                { title: `${a.attempt} ${attempt}`, color: GREEN, items: pos, icon: '✅' },
                { title: a.penalties, color: RED, items: neg, icon: '⚠️' },
              ].map((col) => (
                <section
                  key={col.title}
                  style={{
                    border: '1px solid #eef2e8',
                    borderRadius: 20,
                    padding: 18,
                    background: '#fbfdf9',
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 14px',
                      color: col.color,
                      fontSize: 17,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>{col.icon}</span>
                    {col.title}
                  </h3>

                  {col.items.map((c) => (
                    <div
                      key={c.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 0',
                        borderTop: '1px solid #edf2e7',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: DARK }}>
                          {a.criteria[c.key]}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                          {c.weight > 0 ? '+' : ''}
                          {c.weight} points
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => change(c.key, -1)} style={counterBtn}>
                          −
                        </button>

                        <span
                          style={{
                            minWidth: 28,
                            textAlign: 'center',
                            fontSize: 18,
                            fontWeight: 900,
                            color: DARK,
                          }}
                        >
                          {scores[c.key] || 0}
                        </span>

                        <button onClick={() => change(c.key, 1)} style={counterBtn}>
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={a.comment}
              rows={3}
              style={{
                width: '100%',
                padding: '15px 16px',
                border: '1px solid #dfe8d6',
                borderRadius: 16,
                fontSize: 14,
                resize: 'none',
                marginBottom: 18,
              }}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div style={{ color: '#6b7280', fontSize: 13 }}>
                Current result:{' '}
                <span style={{ color: GREEN, fontWeight: 900, fontSize: 18 }}>
                  {total()} pts
                </span>
              </div>

              <button
                onClick={submitScore}
                disabled={submitting || !selected}
                style={{
                  padding: '15px 28px',
                  background: GREEN,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: submitting || !selected ? 'not-allowed' : 'pointer',
                  opacity: submitting || !selected ? 0.65 : 1,
                  boxShadow: '0 14px 30px rgba(47, 107, 18, 0.22)',
                }}
              >
                {submitting ? 'Saving...' : `${a.submit} ${selected?.name || ''} →`}
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}