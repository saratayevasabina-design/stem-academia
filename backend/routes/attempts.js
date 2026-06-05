const express = require('express');

const router = express.Router();

async function existsById(db, table, id) {
  if (!id) return false;

  try {
    const { rows } = await db.query(
      `SELECT id FROM ${table} WHERE id = $1 LIMIT 1`,
      [id]
    );

    return rows.length > 0;
  } catch {
    return false;
  }
}

router.post('/', async (req, res) => {
  const {
    team_id,
    arena_id,
    attempt_number,
    score,
    time_seconds,
    comment,
    score_details,
  } = req.body;

  if (!team_id) {
    return res.status(400).json({ error: 'team_id is required' });
  }

  if (!attempt_number) {
    return res.status(400).json({ error: 'attempt_number is required' });
  }

  try {
    const teamExists = await existsById(req.db, 'teams', team_id);

    if (!teamExists) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    const validArenaId = await existsById(req.db, 'arenas', arena_id)
      ? arena_id
      : null;

    const validJudgeId = await existsById(req.db, 'users', req.user?.id)
      ? req.user.id
      : null;

    const safeScore = Number(score) || 0;
    const safeTime =
      time_seconds === '' || time_seconds === undefined || time_seconds === null
        ? null
        : Number(time_seconds);

    const { rows } = await req.db.query(
      `
      INSERT INTO attempts (
        team_id,
        arena_id,
        judge_id,
        attempt_number,
        score,
        time_seconds,
        comment
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        team_id,
        validArenaId,
        validJudgeId,
        Number(attempt_number),
        safeScore,
        safeTime,
        comment || null,
      ]
    );

    const attempt = rows[0];

    if (Array.isArray(score_details) && score_details.length > 0) {
      for (const detail of score_details) {
        await req.db.query(
          `
          INSERT INTO score_details (
            attempt_id,
            criterion_key,
            criterion_label,
            value,
            weight,
            is_penalty
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            attempt.id,
            detail.criterion_key || detail.key || 'criterion',
            detail.criterion_label || detail.label || 'Criterion',
            Number(detail.value) || 0,
            Number(detail.weight) || 1,
            Boolean(detail.is_penalty),
          ]
        );
      }
    }

    req.io?.emit('score_updated');
    req.io?.to(`results:${team_id}`).emit('score_updated');

    res.status(201).json(attempt);
  } catch (err) {
    console.error('Attempt save error:', err);

    res.status(500).json({
      error: err.message || 'Ошибка при сохранении оценки',
    });
  }
});

router.get('/', async (req, res) => {
  const { team_id } = req.query;

  try {
    let query = `
      SELECT *
      FROM attempts
    `;

    const params = [];

    if (team_id) {
      query += ` WHERE team_id = $1`;
      params.push(team_id);
    }

    query += ` ORDER BY submitted_at DESC`;

    const { rows } = await req.db.query(query, params);

    res.json(rows);
  } catch (err) {
    console.error('Attempts load error:', err);

    res.status(500).json({
      error: 'Ошибка при загрузке попыток',
    });
  }
});

module.exports = router;