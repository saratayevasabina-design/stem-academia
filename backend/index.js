require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { Pool } = require('pg');

const authRouter = require('./routes/auth');
const teamsRouter = require('./routes/teams');
const tournamentsRouter = require('./routes/tournaments');
const categoriesRouter = require('./routes/categories');
const arenaRouter = require('./routes/arenas');
const attemptsRouter = require('./routes/attempts');
const resultsRouter = require('./routes/results');
const usersRouter = require('./routes/users');
const aiRouter = require('./routes/ai');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.db = db;
  req.io = io;
  next();
});

app.get('/', (req, res) => {
  res.json({ message: 'STEM Academia backend is running' });
});

app.use('/auth', authRouter);
app.use('/teams', teamsRouter);
app.use('/tournaments', tournamentsRouter);
app.use('/categories', categoriesRouter);

/* Arena routes */
app.use('/arena', arenaRouter);
app.use('/arenas', arenaRouter);

/* Attempts / Results / Users */
app.use('/attempts', attemptsRouter);
app.use('/results', resultsRouter);
app.use('/users', usersRouter);
app.use('/ai', aiRouter);

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_results', (tournamentId) => {
    socket.join(`results:${tournamentId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`STEM Academia backend running on port ${PORT}`);
});