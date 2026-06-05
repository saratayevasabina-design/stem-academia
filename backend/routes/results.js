const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const { tournament_id } = req.query;

  if (!tournament_id) {
    return res.status(400).json({ error: 'tournament_id is required' });
  }

  try {
    const { rows } = await req.db.query(
      `
      SELECT
        t.id AS team_id,
        t.name AS team_name,
        t.organization,
        t.city,
        t.coach,

        MAX(CASE WHEN a.attempt_number = 1 THEN a.score END) AS score1,
        MAX(CASE WHEN a.attempt_number = 1 THEN a.time_seconds END) AS time1,

        MAX(CASE WHEN a.attempt_number = 2 THEN a.score END) AS score2,
        MAX(CASE WHEN a.attempt_number = 2 THEN a.time_seconds END) AS time2,

        GREATEST(
          COALESCE(MAX(CASE WHEN a.attempt_number = 1 THEN a.score END), 0),
          COALESCE(MAX(CASE WHEN a.attempt_number = 2 THEN a.score END), 0)
        ) AS total_score,

        LEAST(
          COALESCE(MAX(CASE WHEN a.attempt_number = 1 THEN a.time_seconds END), 999999),
          COALESCE(MAX(CASE WHEN a.attempt_number = 2 THEN a.time_seconds END), 999999)
        ) AS best_time_seconds

      FROM teams t
      LEFT JOIN attempts a ON a.team_id = t.id
      WHERE t.tournament_id = $1
      GROUP BY t.id, t.name, t.organization, t.city, t.coach
      HAVING COUNT(a.id) > 0
      ORDER BY total_score DESC, best_time_seconds ASC
      `,
      [tournament_id]
    );

    const ranked = rows.map((row, index) => ({
      ...row,
      rank: index + 1,
      best_time_seconds:
        row.best_time_seconds === 999999 ? null : row.best_time_seconds,
    }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке результатов' });
  }
});

router.delete('/', async (req, res) => {
  const { tournament_id } = req.query;

  if (!tournament_id) {
    return res.status(400).json({ error: 'tournament_id is required' });
  }

  try {
    const { rowCount } = await req.db.query(
      `
      DELETE FROM attempts
      WHERE team_id IN (
        SELECT id FROM teams
        WHERE tournament_id = $1
      )
      `,
      [tournament_id]
    );

    req.io?.to(`results:${tournament_id}`).emit('score_updated');

    res.json({
      ok: true,
      deleted: rowCount,
      message: 'Результаты очищены',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сбросе результатов' });
  }
});

module.exports = router;