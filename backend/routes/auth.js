const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET || 'dev_secret',
    { expiresIn: '7d' }
  );
}

/* REGISTER */
router.post('/register', async (req, res) => {
  const { username, email, password, full_name } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Введите username, email и пароль',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Пароль должен быть минимум 6 символов',
    });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await req.db.query(
      `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, full_name, role
      `,
      [
        username.trim(),
        email.trim().toLowerCase(),
        password_hash,
        full_name || username,
        'viewer',
      ]
    );

    const user = rows[0];
    const token = createToken(user);

    res.status(201).json({
      token,
      user,
    });
  } catch (err) {
    console.error('Register error:', err);

    if (err.code === '23505') {
      return res.status(400).json({
        error: 'Такой username или email уже существует',
      });
    }

    res.status(500).json({
      error: 'Ошибка при регистрации',
    });
  }
});

/* LOGIN */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: 'Введите логин и пароль',
    });
  }

  try {
    const { rows } = await req.db.query(
      `
      SELECT id, username, email, password_hash, full_name, role
      FROM users
      WHERE username = $1 OR email = $1
      `,
      [username.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(401).json({
        error: 'Неверный логин или пароль',
      });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Неверный логин или пароль',
      });
    }

    const token = createToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);

    res.status(500).json({
      error: 'Ошибка при входе',
    });
  }
});

/* ME */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Нет токена',
    });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const { rows } = await req.db.query(
      `
      SELECT id, username, email, full_name, role
      FROM users
      WHERE id = $1
      `,
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Пользователь не найден',
      });
    }

    res.json(rows[0]);
  } catch (err) {
    return res.status(401).json({
      error: 'Неверный токен',
    });
  }
});

/* FORGOT PASSWORD — SEND EMAIL */
router.post('/forgot-password', async (req, res) => {
  const { usernameOrEmail } = req.body;

  if (!usernameOrEmail) {
    return res.status(400).json({
      error: 'Введите username или email',
    });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({
      error: 'RESEND_API_KEY не найден в Render Environment',
    });
  }

  try {
    const { rows } = await req.db.query(
      `
      SELECT id, username, email, full_name
      FROM users
      WHERE username = $1 OR email = $1
      `,
      [usernameOrEmail.trim().toLowerCase()]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: 'Пользователь не найден',
      });
    }

    const user = rows[0];

    if (!user.email) {
      return res.status(400).json({
        error: 'У этого пользователя нет email',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);

    await req.db.query(
      `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE id = $3
      `,
      [resetToken, expires, user.id]
    );

    const frontendUrl =
      process.env.FRONTEND_URL || 'https://stem-academia.vercel.app';

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: 'STEM Academia <onboarding@resend.dev>',
      to: user.email,
      subject: 'Сброс пароля — STEM Academia',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Сброс пароля</h2>
          <p>Здравствуйте, ${user.full_name || user.username}.</p>
          <p>Вы запросили восстановление пароля для STEM Academia.</p>
          <p>Нажмите на кнопку ниже, чтобы создать новый пароль:</p>
          <p>
            <a 
              href="${resetLink}" 
              style="background:#2f6b12;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold;"
            >
              Сбросить пароль
            </a>
          </p>
          <p>Ссылка действует 30 минут.</p>
          <p>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</p>
        </div>
      `,
    });

    res.json({
      message: 'Ссылка для сброса пароля отправлена на email',
    });
  } catch (err) {
    console.error('Forgot password email error:', err);

    res.status(500).json({
      error: err.message || 'Ошибка при отправке письма',
    });
  }
});

/* RESET PASSWORD */
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      error: 'Введите token и новый пароль',
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: 'Пароль должен быть минимум 6 символов',
    });
  }

  try {
    const { rows } = await req.db.query(
      `
      SELECT id
      FROM users
      WHERE reset_token = $1
        AND reset_token_expires > NOW()
      `,
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({
        error: 'Ссылка недействительна или срок истёк',
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await req.db.query(
      `
      UPDATE users
      SET password_hash = $1,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = $2
      `,
      [password_hash, rows[0].id]
    );

    res.json({
      message: 'Пароль успешно изменён',
    });
  } catch (err) {
    console.error('Reset password error:', err);

    res.status(500).json({
      error: 'Ошибка при смене пароля',
    });
  }
});

module.exports = router;