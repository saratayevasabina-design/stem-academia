import { useEffect, useState } from 'react';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

const TOURNAMENT_ID = '9984a68f-4e8d-414f-b57d-046c12a588a8';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('tournament');

  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [tournament, setTournament] = useState(null);

  const [teamForm, setTeamForm] = useState({
    name: '',
    organization: '',
    city: '',
    coach: '',
  });

  const [userForm, setUserForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'judge',
  });

  const [tournamentForm, setTournamentForm] = useState({
    name_ru: '',
    name_kz: '',
    name_en: '',
    location: '',
    start_date: '',
    end_date: '',
    status: 'active',
  });

  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const clearMessages = () => {
    setMessage('');
    setError('');
  };

  const formatDateForInput = (value) => {
    if (!value) return '';
    return String(value).slice(0, 10);
  };

  const loadTournament = async () => {
    try {
      const res = await api.get(`/tournaments/${TOURNAMENT_ID}`);
      setTournament(res.data);

      setTournamentForm({
        name_ru: res.data.name_ru || '',
        name_kz: res.data.name_kz || '',
        name_en: res.data.name_en || '',
        location: res.data.location || '',
        start_date: formatDateForInput(res.data.start_date),
        end_date: formatDateForInput(res.data.end_date),
        status: res.data.status || 'active',
      });
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке турнира');
    }
  };

  const loadTeams = async () => {
    try {
      const res = await api.get(`/teams?tournament_id=${TOURNAMENT_ID}`);
      setTeams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке команд');
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке пользователей');
    }
  };

  useEffect(() => {
    loadTournament();
    loadTeams();
    loadUsers();
  }, []);

  const saveTournament = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!tournamentForm.name_ru.trim()) {
      setError('Введите название турнира');
      return;
    }

    try {
      const res = await api.put(`/tournaments/${TOURNAMENT_ID}`, tournamentForm);
      setTournament(res.data);
      setMessage('Турнир успешно обновлён ✅');
    } catch (err) {
      console.error(err);
      setError('Ошибка при сохранении турнира');
    }
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      organization: '',
      city: '',
      coach: '',
    });
    setEditingTeamId(null);
  };

  const resetUserForm = () => {
    setUserForm({
      username: '',
      full_name: '',
      password: '',
      role: 'judge',
    });
    setEditingUserId(null);
  };

  const saveTeam = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!teamForm.name.trim()) {
      setError('Введите название команды');
      return;
    }

    try {
      if (editingTeamId) {
        await api.put(`/teams/${editingTeamId}`, {
          ...teamForm,
          tournament_id: TOURNAMENT_ID,
        });
        setMessage('Команда успешно обновлена ✅');
      } else {
        await api.post('/teams', {
          ...teamForm,
          tournament_id: TOURNAMENT_ID,
        });
        setMessage('Команда успешно добавлена ✅');
      }

      resetTeamForm();
      loadTeams();
    } catch (err) {
      console.error(err);
      setError('Ошибка при сохранении команды');
    }
  };

  const editTeam = (team) => {
    setActiveTab('teams');
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name || '',
      organization: team.organization || '',
      city: team.city || '',
      coach: team.coach || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTeam = async (id) => {
    if (!window.confirm('Удалить эту команду?')) return;

    clearMessages();

    try {
      await api.delete(`/teams/${id}`);
      setMessage('Команда удалена ✅');
      loadTeams();
    } catch (err) {
      console.error(err);
      setError('Ошибка при удалении команды');
    }
  };

  const saveUser = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!userForm.username.trim()) {
      setError('Введите логин');
      return;
    }

    if (!editingUserId && !userForm.password.trim()) {
      setError('Введите пароль для нового пользователя');
      return;
    }

    try {
      if (editingUserId) {
        const payload = {
          username: userForm.username,
          full_name: userForm.full_name,
          role: userForm.role,
        };

        if (userForm.password.trim()) {
          payload.password = userForm.password;
        }

        await api.put(`/users/${editingUserId}`, payload);
        setMessage('Пользователь успешно обновлён ✅');
      } else {
        await api.post('/users', userForm);
        setMessage('Пользователь успешно добавлен ✅');
      }

      resetUserForm();
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при сохранении пользователя');
    }
  };

  const editUser = (user) => {
    setActiveTab('judges');
    setEditingUserId(user.id);
    setUserForm({
      username: user.username || '',
      full_name: user.full_name || '',
      password: '',
      role: user.role || 'judge',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Удалить этого пользователя?')) return;

    clearMessages();

    try {
      await api.delete(`/users/${id}`);
      setMessage('Пользователь удалён ✅');
      loadUsers();
    } catch (err) {
      console.error(err);
      setError('Ошибка при удалении пользователя');
    }
  };

  const resetResults = async () => {
    if (!window.confirm('Точно сбросить все результаты? Это удалит все оценки попыток.')) {
      return;
    }

    clearMessages();

    try {
      const res = await api.delete(`/results?tournament_id=${TOURNAMENT_ID}`);
      setMessage(`Результаты очищены ✅ Удалено попыток: ${res.data.deleted}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при сбросе результатов');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, paddingBottom: 60 }}>
      <section
        style={{
          maxWidth: 1100,
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
          ● Admin dashboard
        </div>

        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 900 }}>
          Главная админ-панель
        </h1>

        <p style={{ fontSize: 17, marginTop: 14, opacity: 0.9 }}>
          Управление турниром, командами, судьями, ареной и результатами.
        </p>
      </section>

      <main style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={tabsBox}>
          <button
            style={activeTab === 'tournament' ? tabActive : tab}
            onClick={() => {
              clearMessages();
              setActiveTab('tournament');
            }}
          >
            🏆 Турнир
          </button>

          <button
            style={activeTab === 'teams' ? tabActive : tab}
            onClick={() => {
              clearMessages();
              setActiveTab('teams');
            }}
          >
            👥 Команды
          </button>

          <button
            style={activeTab === 'judges' ? tabActive : tab}
            onClick={() => {
              clearMessages();
              setActiveTab('judges');
            }}
          >
            ⚖️ Судьи
          </button>

          <button
            style={activeTab === 'quick' ? tabActive : tab}
            onClick={() => {
              clearMessages();
              setActiveTab('quick');
            }}
          >
            ⚡ Быстрые действия
          </button>
        </div>

        {(message || error) && (
          <div
            style={{
              background: error ? '#fde8e8' : '#e8f8ee',
              color: error ? '#991b1b' : GREEN,
              padding: '16px 20px',
              borderRadius: 16,
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {error || message}
          </div>
        )}

        {activeTab === 'tournament' && (
          <section style={card}>
            <h2 style={title}>Настройки турнира</h2>

            {tournament && (
              <div
                style={{
                  background: '#f8fbf4',
                  border: '1px solid #e5eadf',
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 20,
                }}
              >
                <b style={{ color: DARK }}>Текущий турнир:</b>
                <div style={{ color: '#4b5563', marginTop: 8 }}>
                  {tournament.name_ru} · {tournament.location} · {tournament.status}
                </div>
              </div>
            )}

            <form onSubmit={saveTournament} style={{ display: 'grid', gap: 14 }}>
              <input
                style={input}
                placeholder="Название RU"
                value={tournamentForm.name_ru}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, name_ru: e.target.value })
                }
              />

              <input
                style={input}
                placeholder="Название KZ"
                value={tournamentForm.name_kz}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, name_kz: e.target.value })
                }
              />

              <input
                style={input}
                placeholder="Название EN"
                value={tournamentForm.name_en}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, name_en: e.target.value })
                }
              />

              <input
                style={input}
                placeholder="Локация"
                value={tournamentForm.location}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, location: e.target.value })
                }
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={label}>Дата начала</label>
                  <input
                    style={input}
                    type="date"
                    value={tournamentForm.start_date}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label style={label}>Дата окончания</label>
                  <input
                    style={input}
                    type="date"
                    value={tournamentForm.end_date}
                    onChange={(e) =>
                      setTournamentForm({
                        ...tournamentForm,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <select
                style={input}
                value={tournamentForm.status}
                onChange={(e) =>
                  setTournamentForm({ ...tournamentForm, status: e.target.value })
                }
              >
                <option value="active">Активный</option>
                <option value="finished">Завершён</option>
                <option value="draft">Черновик</option>
              </select>

              <button style={primaryBtn} type="submit">
                Сохранить настройки турнира
              </button>
            </form>
          </section>
        )}

        {activeTab === 'teams' && (
          <section style={grid}>
            <div style={card}>
              <h2 style={title}>
                {editingTeamId ? 'Редактировать команду' : 'Добавить команду'}
              </h2>

              <form onSubmit={saveTeam} style={{ display: 'grid', gap: 14 }}>
                <input
                  style={input}
                  placeholder="Название команды"
                  value={teamForm.name}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, name: e.target.value })
                  }
                />

                <input
                  style={input}
                  placeholder="Организация / школа"
                  value={teamForm.organization}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, organization: e.target.value })
                  }
                />

                <input
                  style={input}
                  placeholder="Город"
                  value={teamForm.city}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, city: e.target.value })
                  }
                />

                <input
                  style={input}
                  placeholder="Тренер"
                  value={teamForm.coach}
                  onChange={(e) =>
                    setTeamForm({ ...teamForm, coach: e.target.value })
                  }
                />

                <button style={primaryBtn} type="submit">
                  {editingTeamId ? 'Сохранить изменения' : 'Добавить команду'}
                </button>

                {editingTeamId && (
                  <button
                    style={secondaryBtn}
                    type="button"
                    onClick={resetTeamForm}
                  >
                    Отменить редактирование
                  </button>
                )}
              </form>
            </div>

            <div style={card}>
              <div style={sectionHeader}>
                <h2 style={title}>Список команд</h2>
                <span style={badge}>{teams.length}</span>
              </div>

              {teams.length === 0 ? (
                <p style={muted}>Пока нет команд</p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {teams.map((team) => (
                    <div key={team.id} style={listItem}>
                      <div>
                        <b style={{ color: DARK }}>{team.name}</b>
                        <div style={mutedSmall}>
                          {team.organization || '-'} · {team.city || '-'} ·{' '}
                          {team.coach || '-'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={editBtn} onClick={() => editTeam(team)}>
                          Редактировать
                        </button>
                        <button
                          style={dangerBtn}
                          onClick={() => deleteTeam(team.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'judges' && (
          <section style={grid}>
            <div style={card}>
              <h2 style={title}>
                {editingUserId ? 'Редактировать пользователя' : 'Добавить судью'}
              </h2>

              <form onSubmit={saveUser} style={{ display: 'grid', gap: 14 }}>
                <input
                  style={input}
                  placeholder="Логин, например judge3"
                  value={userForm.username}
                  onChange={(e) =>
                    setUserForm({ ...userForm, username: e.target.value })
                  }
                />

                <input
                  style={input}
                  placeholder="Полное имя"
                  value={userForm.full_name}
                  onChange={(e) =>
                    setUserForm({ ...userForm, full_name: e.target.value })
                  }
                />

                <input
                  style={input}
                  placeholder={
                    editingUserId
                      ? 'Новый пароль, если нужно изменить'
                      : 'Пароль'
                  }
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                />

                <select
                  style={input}
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                >
                  <option value="judge">Судья</option>
                  <option value="admin">Главный администратор</option>
                </select>

                <button style={primaryBtn} type="submit">
                  {editingUserId ? 'Сохранить пользователя' : 'Добавить судью'}
                </button>

                {editingUserId && (
                  <button
                    style={secondaryBtn}
                    type="button"
                    onClick={resetUserForm}
                  >
                    Отменить редактирование
                  </button>
                )}
              </form>
            </div>

            <div style={card}>
              <div style={sectionHeader}>
                <h2 style={title}>Судьи и администраторы</h2>
                <span style={badge}>{users.length}</span>
              </div>

              {users.length === 0 ? (
                <p style={muted}>Пока нет пользователей</p>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {users.map((user) => (
                    <div key={user.id} style={listItem}>
                      <div>
                        <b style={{ color: DARK }}>
                          {user.full_name || user.username}
                        </b>
                        <div style={mutedSmall}>
                          Логин: {user.username} · Роль:{' '}
                          {user.role === 'admin' ? 'Администратор' : 'Судья'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={editBtn} onClick={() => editUser(user)}>
                          Редактировать
                        </button>
                        <button
                          style={dangerBtn}
                          onClick={() => deleteUser(user.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'quick' && (
          <section style={card}>
            <h2 style={title}>Быстрые действия</h2>

            <div style={quickGrid}>
              <QuickCard
                title="Открыть арену"
                text="Перейти к live scoring panel."
                button="Открыть"
                onClick={() => (window.location.href = '/arena')}
              />

              <QuickCard
                title="Открыть результаты"
                text="Посмотреть таблицу и экспорт PDF."
                button="Открыть"
                onClick={() => (window.location.href = '/results')}
              />

              <QuickCard
                title="Обновить данные"
                text="Перезагрузить турнир, команды и пользователей."
                button="Обновить"
                onClick={() => {
                  loadTournament();
                  loadTeams();
                  loadUsers();
                  setMessage('Данные обновлены ✅');
                }}
              />

              <QuickCard
                title="Сбросить результаты"
                text="Удалить все оценки попыток перед новым запуском."
                button="Сбросить"
                danger
                onClick={resetResults}
              />
            </div>

            <div
              style={{
                marginTop: 24,
                padding: 18,
                borderRadius: 16,
                background: '#f8fbf4',
                border: '1px solid #e5eadf',
              }}
            >
              <b style={{ color: DARK }}>Статистика:</b>
              <div style={{ marginTop: 10, color: '#4b5563' }}>
                Команд: <b>{teams.length}</b> · Пользователей:{' '}
                <b>{users.length}</b>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function QuickCard({ title, text, button, onClick, danger }) {
  return (
    <div style={quickCard}>
      <h3 style={{ margin: 0, color: DARK, fontSize: 20 }}>{title}</h3>
      <p style={{ color: '#6b7280', minHeight: 42 }}>{text}</p>
      <button style={danger ? dangerBigBtn : primaryBtn} onClick={onClick}>
        {button}
      </button>
    </div>
  );
}

const tabsBox = {
  display: 'flex',
  gap: 10,
  background: '#fff',
  padding: 10,
  borderRadius: 18,
  marginBottom: 20,
  boxShadow: '0 12px 35px rgba(47,107,18,0.08)',
  flexWrap: 'wrap',
};

const tab = {
  border: 'none',
  background: '#f3f4f6',
  color: '#374151',
  borderRadius: 14,
  padding: '13px 18px',
  fontWeight: 900,
  cursor: 'pointer',
  fontSize: 15,
};

const tabActive = {
  ...tab,
  background: GREEN,
  color: '#fff',
};

const grid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.3fr',
  gap: 24,
};

const card = {
  background: '#fff',
  borderRadius: 24,
  padding: 28,
  boxShadow: '0 20px 50px rgba(47,107,18,0.08)',
};

const title = {
  margin: 0,
  marginBottom: 18,
  color: DARK,
  fontSize: 26,
  fontWeight: 900,
};

const input = {
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #dfe8d6',
  borderRadius: 14,
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
};

const label = {
  display: 'block',
  marginBottom: 8,
  color: '#4b5563',
  fontWeight: 800,
  fontSize: 13,
};

const primaryBtn = {
  background: GREEN,
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '15px 18px',
  fontWeight: 900,
  cursor: 'pointer',
  fontSize: 15,
};

const dangerBigBtn = {
  background: '#991b1b',
  color: '#fff',
  border: 'none',
  borderRadius: 14,
  padding: '15px 18px',
  fontWeight: 900,
  cursor: 'pointer',
  fontSize: 15,
};

const secondaryBtn = {
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: 14,
  padding: '15px 18px',
  fontWeight: 800,
  cursor: 'pointer',
  fontSize: 15,
};

const editBtn = {
  background: '#eef7e8',
  color: GREEN,
  border: '1px solid #d9e8cf',
  borderRadius: 12,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const dangerBtn = {
  background: '#fde8e8',
  color: '#991b1b',
  border: '1px solid #fecaca',
  borderRadius: 12,
  padding: '10px 14px',
  fontWeight: 800,
  cursor: 'pointer',
};

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const badge = {
  background: '#e8f3df',
  color: GREEN,
  borderRadius: 999,
  padding: '8px 13px',
  fontWeight: 900,
};

const listItem = {
  border: '1px solid #e5eadf',
  borderRadius: 16,
  padding: 16,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 14,
  background: '#fbfdf9',
};

const muted = {
  color: '#6b7280',
  margin: 0,
};

const mutedSmall = {
  color: '#6b7280',
  fontSize: 13,
  marginTop: 5,
};

const quickGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 16,
};

const quickCard = {
  border: '1px solid #e5eadf',
  background: '#fbfdf9',
  borderRadius: 18,
  padding: 20,
};