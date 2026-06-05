import { useEffect, useState } from 'react';
import api from '../api/client';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.vfs || pdfFonts.pdfMake?.vfs;

const GREEN = '#2f6b12';
const DARK = '#153308';

const TOURNAMENT_ID = '9984a68f-4e8d-414f-b57d-046c12a588a8';

function formatTime(seconds) {
  if (seconds === null || seconds === undefined) return '—';

  const value = Number(seconds);
  if (Number.isNaN(value)) return '—';

  const min = Math.floor(value / 60);
  const sec = Math.floor(value % 60);

  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatDate(value) {
  if (!value) return '—';

  try {
    return new Date(value).toLocaleDateString('ru-RU');
  } catch {
    return '—';
  }
}

function statusText(status) {
  if (status === 'active') return 'Активный';
  if (status === 'finished') return 'Завершён';
  if (status === 'draft') return 'Черновик';
  return status || '—';
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [tournament, setTournament] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadResults = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [resultsRes, tournamentRes] = await Promise.all([
        api.get(`/results?tournament_id=${TOURNAMENT_ID}`),
        api.get(`/tournaments/${TOURNAMENT_ID}`),
      ]);

      setResults(Array.isArray(resultsRes.data) ? resultsRes.data : []);
      setTournament(tournamentRes.data);
    } catch (err) {
      console.error(err);
      setMessage('Ошибка при загрузке результатов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const getTournamentName = () => {
    return (
      tournament?.name_ru ||
      tournament?.name_en ||
      tournament?.name_kz ||
      'STEM Academia Olympiad'
    );
  };

  const exportPDF = () => {
    const tournamentName = getTournamentName();

    const tableBody = [
      [
        { text: '№', style: 'tableHeader' },
        { text: 'Команда', style: 'tableHeader' },
        { text: 'Организация', style: 'tableHeader' },
        { text: 'Город', style: 'tableHeader' },
        { text: 'Тренер', style: 'tableHeader' },
        { text: 'Итог', style: 'tableHeader' },
        { text: 'Лучшее время', style: 'tableHeader' },
        { text: 'Попытка 1', style: 'tableHeader' },
        { text: 'Попытка 2', style: 'tableHeader' },
      ],
      ...results.map((row, index) => [
        String(row.rank || index + 1),
        row.team_name || row.name || '—',
        row.organization || '—',
        row.city || '—',
        row.coach || '—',
        String(row.total_score ?? 0),
        formatTime(row.best_time_seconds),
        row.score1 !== null && row.score1 !== undefined
          ? `${row.score1} / ${formatTime(row.time1)}`
          : '—',
        row.score2 !== null && row.score2 !== undefined
          ? `${row.score2} / ${formatTime(row.time2)}`
          : '—',
      ]),
    ];

    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [35, 35, 35, 45],

      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: tournamentName,
              alignment: 'left',
              margin: [35, 0, 0, 0],
              fontSize: 8,
              color: '#777',
            },
            {
              text: `Страница ${currentPage} из ${pageCount}`,
              alignment: 'right',
              margin: [0, 0, 35, 0],
              fontSize: 8,
              color: '#777',
            },
          ],
        };
      },

      content: [
        {
          columns: [
            {
              stack: [
                {
                  text: 'STEM ACADEMIA',
                  style: 'brand',
                },
                {
                  text: 'Официальный протокол результатов',
                  style: 'title',
                },
                {
                  text: tournamentName,
                  style: 'subtitle',
                },
              ],
            },
            {
              stack: [
                {
                  text: 'ПРОТОКОЛ',
                  style: 'protocolBadge',
                  alignment: 'center',
                },
                {
                  text: `Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`,
                  alignment: 'right',
                  margin: [0, 12, 0, 0],
                  fontSize: 10,
                },
                {
                  text: `Время: ${new Date().toLocaleTimeString('ru-RU')}`,
                  alignment: 'right',
                  fontSize: 10,
                },
              ],
              width: 210,
            },
          ],
          margin: [0, 0, 0, 20],
        },

        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 770,
              y2: 0,
              lineWidth: 1,
              lineColor: '#2f6b12',
            },
          ],
          margin: [0, 0, 0, 18],
        },

        {
          columns: [
            {
              text: [
                { text: 'Турнир: ', bold: true },
                tournamentName,
              ],
              fontSize: 10,
            },
            {
              text: [
                { text: 'Локация: ', bold: true },
                tournament?.location || '—',
              ],
              fontSize: 10,
            },
            {
              text: [
                { text: 'Статус: ', bold: true },
                statusText(tournament?.status),
              ],
              fontSize: 10,
            },
          ],
          margin: [0, 0, 0, 8],
        },

        {
          columns: [
            {
              text: [
                { text: 'Дата начала: ', bold: true },
                formatDate(tournament?.start_date),
              ],
              fontSize: 10,
            },
            {
              text: [
                { text: 'Дата окончания: ', bold: true },
                formatDate(tournament?.end_date),
              ],
              fontSize: 10,
            },
            {
              text: [
                { text: 'Всего команд в протоколе: ', bold: true },
                String(results.length),
              ],
              fontSize: 10,
            },
          ],
          margin: [0, 0, 0, 18],
        },

        {
          table: {
            headerRows: 1,
            widths: [25, 90, 105, 65, 80, 45, 65, 70, 70],
            body: tableBody,
          },
          layout: {
            fillColor: function (rowIndex) {
              if (rowIndex === 0) return '#2f6b12';
              return rowIndex % 2 === 0 ? '#f3f8ec' : null;
            },
            hLineColor: function () {
              return '#d9e8cf';
            },
            vLineColor: function () {
              return '#d9e8cf';
            },
            hLineWidth: function () {
              return 0.7;
            },
            vLineWidth: function () {
              return 0.7;
            },
          },
          margin: [0, 0, 0, 25],
        },

        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: 'Подпись судьи',
                  bold: true,
                  margin: [0, 0, 0, 20],
                },
                {
                  text: '____________________________',
                },
                {
                  text: 'ФИО / Signature',
                  fontSize: 8,
                  color: '#777',
                  margin: [0, 5, 0, 0],
                },
              ],
            },
            {
              width: '*',
              stack: [
                {
                  text: 'Подпись главного секретаря',
                  bold: true,
                  margin: [0, 0, 0, 20],
                },
                {
                  text: '____________________________',
                },
                {
                  text: 'ФИО / Signature',
                  fontSize: 8,
                  color: '#777',
                  margin: [0, 5, 0, 0],
                },
              ],
            },
          ],
          margin: [0, 15, 0, 0],
        },
      ],

      styles: {
        brand: {
          fontSize: 11,
          bold: true,
          color: '#2f6b12',
          margin: [0, 0, 0, 6],
        },
        title: {
          fontSize: 22,
          bold: true,
          color: '#153308',
          margin: [0, 0, 0, 5],
        },
        subtitle: {
          fontSize: 12,
          color: '#555',
        },
        protocolBadge: {
          fontSize: 12,
          bold: true,
          color: '#fff',
          fillColor: '#2f6b12',
          margin: [0, 6, 0, 6],
        },
        tableHeader: {
          bold: true,
          color: '#fff',
          fontSize: 9,
        },
      },

      defaultStyle: {
        fontSize: 8,
      },
    };

    pdfMake.createPdf(docDefinition).download('official-results-protocol.pdf');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f8ec', paddingBottom: 60 }}>
      <section
        style={{
          maxWidth: 1100,
          margin: '50px auto 30px',
          background: GREEN,
          color: '#fff',
          borderRadius: 28,
          padding: '50px 55px',
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
          ● Official results
        </div>

        <h1 style={{ fontSize: 40, margin: 0, fontWeight: 900 }}>
          Результаты
        </h1>

        <p style={{ fontSize: 17, marginTop: 14, opacity: 0.9 }}>
          {getTournamentName()}
        </p>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 20px 50px rgba(47,107,18,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: DARK, fontSize: 28 }}>
              Таблица результатов
            </h2>
            <p style={{ color: '#6b7280', marginTop: 8 }}>
              {tournament?.location || '—'} · {formatDate(tournament?.start_date)} —{' '}
              {formatDate(tournament?.end_date)} · {statusText(tournament?.status)}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={loadResults}
              style={{
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 22px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {loading ? 'Загрузка...' : 'Обновить'}
            </button>

            <button
              onClick={exportPDF}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 22px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Экспорт PDF
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              background: '#fde8e8',
              color: '#991b1b',
              padding: '14px 16px',
              borderRadius: 12,
              fontWeight: 700,
              marginBottom: 20,
            }}
          >
            {message}
          </div>
        )}

        {results.length === 0 ? (
          <div
            style={{
              border: '1px dashed #d9e8cf',
              borderRadius: 18,
              padding: 60,
              textAlign: 'center',
              color: '#6b7280',
              fontSize: 18,
            }}
          >
            <div style={{ fontSize: 42, marginBottom: 12 }}>🏆</div>
            Пока нет результатов
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ background: GREEN, color: '#fff' }}>
                  <th style={th}>Место</th>
                  <th style={th}>Команда</th>
                  <th style={th}>Организация</th>
                  <th style={th}>Город</th>
                  <th style={th}>Тренер</th>
                  <th style={th}>Итого</th>
                  <th style={th}>Лучшее время</th>
                  <th style={th}>Попытка 1</th>
                  <th style={th}>Попытка 2</th>
                </tr>
              </thead>

              <tbody>
                {results.map((row, index) => (
                  <tr
                    key={row.team_id || index}
                    style={{
                      background: index % 2 === 0 ? '#f8fbf4' : '#fff',
                      borderBottom: '1px solid #e5eadf',
                    }}
                  >
                    <td style={td}>{row.rank || index + 1}</td>
                    <td style={td}>{row.team_name || row.name || '—'}</td>
                    <td style={td}>{row.organization || '—'}</td>
                    <td style={td}>{row.city || '—'}</td>
                    <td style={td}>{row.coach || '—'}</td>
                    <td style={{ ...td, fontWeight: 900, color: GREEN }}>
                      {row.total_score ?? 0}
                    </td>
                    <td style={td}>{formatTime(row.best_time_seconds)}</td>
                    <td style={td}>
                      {row.score1 !== null && row.score1 !== undefined
                        ? `${row.score1} / ${formatTime(row.time1)}`
                        : '—'}
                    </td>
                    <td style={td}>
                      {row.score2 !== null && row.score2 !== undefined
                        ? `${row.score2} / ${formatTime(row.time2)}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const th = {
  textAlign: 'left',
  padding: '14px 12px',
  fontWeight: 900,
  whiteSpace: 'nowrap',
};

const td = {
  padding: '14px 12px',
  color: '#374151',
  whiteSpace: 'nowrap',
};