const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await req.db.query(
      `
      SELECT id, username, full_name, role, created_at
      FROM users
      ORDER BY created_at ASC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке пользователей' });
  }
});

router.post('/', async (req, res) => {
  const { username, password, full_name, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Введите логин и пароль' });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await req.db.query(
      `
      INSERT INTO users (username, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, full_name, role, created_at
      `,
      [
        username,
        password_hash,
        full_name || username,
        role || 'judge',
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Такой логин уже существует' });
    }

    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, full_name, role } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Введите логин' });
  }

  try {
    let query;
    let params;

    if (password) {
      const password_hash = await bcrypt.hash(password, 10);

      query = `
        UPDATE users
        SET username = $1,
            password_hash = $2,
            full_name = $3,
            role = $4
        WHERE id = $5
        RETURNING id, username, full_name, role, created_at
      `;

      params = [
        username,
        password_hash,
        full_name || username,
        role || 'judge',
        id,
      ];
    } else {
      query = `
        UPDATE users
        SET username = $1,
            full_name = $2,
            role = $3
        WHERE id = $4
        RETURNING id, username, full_name, role, created_at
      `;

      params = [
        username,
        full_name || username,
        role || 'judge',
        id,
      ];
    }

    const { rows } = await req.db.query(query, params);

    if (!rows.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Такой логин уже существует' });
    }

    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await req.db.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
});

module.exports = router;