// server.js
const express = require('express');
const axios = require('axios');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

const app = express();

// =========================
// 1. Configurar HTTP + Socket.IO
// =========================
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

// Middleware Express
app.use(express.json());
// Servir ficheiros estáticos (pasta “public”)
app.use(express.static('public'));

// =========================
// 2. Lógica de chat em tempo real
// =========================
/**
 * Fluxo:
 * - Cada sala identifica um par tutor⇄aluno. 
 *   Por exemplo: room = `chat_TUTORID_ALUNOID`.
 * - Quando um cliente (tutor ou aluno) se liga, envia “join_room” com:
 *     { room: 'chat_123_456', userType: 'tutor' | 'aluno', userName: 'Beatriz Sousa' }
 * - O servidor associa o socket àquela sala (socket.join(room)).
 * - Quando o cliente envia “send_message” com:
 *     { room: 'chat_123_456', text: 'Olá, prof!', userType: 'aluno', timestamp: '12:45' }
 *   O servidor faz io.to(room).emit('receive_message', mesma_payload) para todos na sala.
 */

io.on('connection', (socket) => {
  console.log('🔌 Novo socket conectado:', socket.id);

  // O frontend chama socket.emit('join_room', {...});
  socket.on('join_room', ({ room, userType, userName }) => {
    socket.join(room);
    console.log(`👥 ${userType} "${userName}" entrou na sala "${room}"`);
  });

  // O frontend chama socket.emit('send_message', {...});
  socket.on('send_message', (msgData) => {
    // msgData = { room, text, userType, userName, timestamp }
    const { room } = msgData;
    // Retransmitir para todos na sala (incluindo quem enviou)
    io.to(room).emit('receive_message', msgData);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Socket desconectado:', socket.id);
  });
});

// =========================
// 3. Rotas HTTP originais (Zoom, email, etc.)
//    — Sem alterações substanciais, só adicionámos Socket.IO acima.
// =========================

// Variáveis de ambiente (Zoom e email)
const {
  ZOOM_CLIENT_ID,
  ZOOM_CLIENT_SECRET,
  ZOOM_ACCOUNT_ID,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT
} = process.env;

// Configuração do transporte de email (igual ao original)
const emailTransporter = nodemailer.createTransport({
  host: EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(EMAIL_PORT) || 587,
  secure: false,
  auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

emailTransporter.verify((error, success) => {
  if (error) {
    console.log('❌ Erro configuração email:', error.message);
  } else {
    console.log('✅ Email server pronto');
  }
});

// Funções getZoomAccessToken, createZoomMeeting, sendMeetingEmails...
// (copiar do server.js original, sem alterar)

// Rota para criar-meeting: app.post('/api/create-meeting', ...) (igual ao original)

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint não encontrado' });
});

app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ success: false, message: 'Erro interno do servidor' });
});

// Em vez de app.listen, usamos http.listen para incluir Socket.IO
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('🚀 EduLink Server (com Socket.IO) a correr na porta', PORT);
});

module.exports = http;
