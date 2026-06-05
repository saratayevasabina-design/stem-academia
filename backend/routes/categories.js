const router = require('express').Router();
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { tournament_id } = req.query;
  try {
    const { rows } = await req.db.query(
      'SELECT * FROM categories WHERE tournament_id=$1 ORDER BY name_ru', [tournament_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка' }); }
});

router.post('/', authMiddleware, requireRole('admin'), async (req, res) => {
  const { tournament_id, name_ru, name_kz, name_en, max_attempts, time_limit_seconds } = req.body;
  const { rows } = await req.db.query(
    'INSERT INTO categories (tournament_id,name_ru,name_kz,name_en,max_attempts,time_limit_seconds) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [tournament_id, name_ru, name_kz, name_en, max_attempts || 2, time_limit_seconds || 300]
  );
  res.status(201).json(rows[0]);
});

module.exports = router;
