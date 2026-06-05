const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.post('/', authMiddleware, requireRole('judge', 'admin'), async (req, res) => {
  const { team_id, arena_id, attempt_number, score, time_seconds, comment, details, tournament_id } = req.body;
  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO attempts (team_id,arena_id,judge_id,attempt_number,score,time_seconds,comment) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [team_id, arena_id, req.user.id, attempt_number, score, time_seconds, comment]
    );
    const attempt = rows[0];
    if (details?.length) {
      for (const d of details) {
        await client.query(
          'INSERT INTO score_details (attempt_id,criterion_key,criterion_label,value,weight,is_penalty) VALUES ($1,$2,$3,$4,$5,$6)',
          [attempt.id, d.key, d.label, d.value, d.weight, d.is_penalty || false]
        );
      }
    }
    // Update results
    const teamRes = await client.query('SELECT * FROM teams WHERE id = $1', [team_id]);
    const team = teamRes.rows[0];
    const attRes = await client.query('SELECT MAX(score) as best, MIN(time_seconds) as best_time FROM attempts WHERE team_id = $1', [team_id]);
    await client.query(
      `INSERT INTO results (team_id,tournament_id,category_id,total_score,best_time_seconds,rank)
       VALUES ($1,$2,$3,$4,$5,0)
       ON CONFLICT (team_id) DO UPDATE SET total_score=EXCLUDED.total_score, best_time_seconds=EXCLUDED.best_time_seconds, updated_at=NOW()`,
      [team_id, team.tournament_id, team.category_id, attRes.rows[0].best || 0, attRes.rows[0].best_time]
    );
    await client.query('COMMIT');
    if (tournament_id) req.io.to(`results_${tournament_id}`).emit('score_updated', { team_id, score, attempt_number });
    res.status(201).json({ success: true, attempt });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении оценки' });
  } finally { client.release(); }
});

router.get('/:team_id', authMiddleware, async (req, res) => {
  try {
    const { rows } = await req.db.query(
      'SELECT a.*, u.full_name as judge_name FROM attempts a JOIN users u ON u.id=a.judge_id WHERE a.team_id=$1 ORDER BY a.attempt_number',
      [req.params.team_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

module.exports = router;
