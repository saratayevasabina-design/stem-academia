const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await req.db.query(
      `
      SELECT 
        id,
        name_ru,
        name_kz,
        name_en,
        location,
        start_date,
        end_date,
        status,
        created_at
      FROM tournaments
      ORDER BY created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке турниров' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await req.db.query(
      `
      SELECT 
        id,
        name_ru,
        name_kz,
        name_en,
        location,
        start_date,
        end_date,
        status,
        created_at
      FROM tournaments
      WHERE id = $1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке турнира' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const {
    name_ru,
    name_kz,
    name_en,
    location,
    start_date,
    end_date,
    status,
  } = req.body;

  try {
    const { rows } = await req.db.query(
      `
      UPDATE tournaments
      SET 
        name_ru = $1,
        name_kz = $2,
        name_en = $3,
        location = $4,
        start_date = $5,
        end_date = $6,
        status = $7
      WHERE id = $8
      RETURNING 
        id,
        name_ru,
        name_kz,
        name_en,
        location,
        start_date,
        end_date,
        status,
        created_at
      `,
      [
        name_ru,
        name_kz,
        name_en,
        location,
        start_date,
        end_date,
        status,
        id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при сохранении турнира' });
  }
});

module.exports = router;