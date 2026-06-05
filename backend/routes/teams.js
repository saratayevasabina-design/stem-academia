const express = require('express');

const router = express.Router();

router.get('/', async (req, res) => {
  const { tournament_id } = req.query;

  try {
    let query = `
      SELECT id, name, organization, city, coach, tournament_id
      FROM teams
    `;

    const params = [];

    if (tournament_id) {
      query += ` WHERE tournament_id = $1`;
      params.push(tournament_id);
    }

    query += ` ORDER BY created_at ASC NULLS LAST, name ASC`;

    const { rows } = await req.db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке команд' });
  }
});

router.post('/', async (req, res) => {
  const { name, organization, city, coach, tournament_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Введите название команды' });
  }

  try {
    const { rows } = await req.db.query(
      `
      INSERT INTO teams (name, organization, city, coach, tournament_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, organization, city, coach, tournament_id
      `,
      [
        name,
        organization || null,
        city || null,
        coach || null,
        tournament_id || null,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при добавлении команды' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, organization, city, coach, tournament_id } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Введите название команды' });
  }

  try {
    const { rows } = await req.db.query(
      `
      UPDATE teams
      SET name = $1,
          organization = $2,
          city = $3,
          coach = $4,
          tournament_id = $5
      WHERE id = $6
      RETURNING id, name, organization, city, coach, tournament_id
      `,
      [
        name,
        organization || null,
        city || null,
        coach || null,
        tournament_id || null,
        id,
      ]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении команды' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await req.db.query(
      `
      DELETE FROM teams
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Команда не найдена' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении команды' });
  }
});

module.exports = router;