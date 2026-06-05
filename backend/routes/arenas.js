const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  const { tournament_id } = req.query;
  try {
    const { rows } = await req.db.query(
      `SELECT ar.*, u.full_name as judge_name, c.name_ru as category_name
       FROM arenas ar
       LEFT JOIN users u ON u.id=ar.judge_id
       LEFT JOIN categories c ON c.id=ar.category_id
       WHERE ar.tournament_id=$1`, [tournament_id]
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

module.exports = router;
