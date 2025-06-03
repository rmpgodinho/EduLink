// public/js/chat_aluno.js

// 1. Obter referências aos elementos do DOM
const socket = io(); // Conexão Socket.IO
const contactsEls = document.querySelectorAll(".contact");
const chatAvatarEl = document.querySelector(".chat-avatar");
const chatNameEl   = document.querySelector(".chat-user-info h2");
const chatSubEl    = document.querySelector(".chat-user-info p");
const chatMessages = document.querySelector(".chat-messages");
const inputEl      = document.getElementById("message-input");
const sendBtn      = document.getElementById("send-button");

// 2. Informação do utilizador "aluno" (poderiam vir de uma API real ou sessão)
const currentUser = {
  userType: "aluno",
  userName: "Beatriz Sousa",
  // Supondo que tutorID = 123 e alunoID = 456 (estes valores viriam do sistema real)
  alunoID: 456
};

// Variável para armazenar a sala atual (room) selecionada
let currentRoom = null;

// 3. Função para formatar hora (hh:mm)
function formatTime(date) {
  const h = date.getHours(), m = date.getMinutes();
  const hh = h < 10 ? "0" + h : h;
  const mm = m < 10 ? "0" + m : m;
  return `${hh}:${mm}`;
}

// 4. Função que carrega e exibe toda a conversa já recebida
function loadConversation(room, tutorName) {
  // Atualizar cabeçalho de chat
  chatAvatarEl.src = "https://via.placeholder.com/80"; // Podem colocar avatar real do tutor
  chatNameEl.textContent = tutorName;
  chatSubEl.textContent = "Pronto para ajudar no que precisa!";

  // Limpar mensagens antigas
  chatMessages.innerHTML = "";

  // Guardar a sala atual e avisar ao servidor que o aluno entrou nela
  currentRoom = room;
  socket.emit("join_room", {
    room: room,
    userType: currentUser.userType,
    userName: currentUser.userName
  });
}

// 5. Ao carregar, selecionar o primeiro contato (já tem class="selected" no HTML)
document.addEventListener("DOMContentLoaded", () => {
  const selected = document.querySelector(".contact.selected");
  if (selected) {
    loadConversation(selected.dataset.room, selected.dataset.name);
  }
});

// 6. Alternar entre contatos (tutores)
contactsEls.forEach(el => {
  el.addEventListener("click", () => {
    // Remover classe “selected” do contacto anterior
    document.querySelector(".contact.selected").classList.remove("selected");
    // Adicionar a classe ao atual
    el.classList.add("selected");
    // Carregar a conversa para esta sala
    loadConversation(el.dataset.room, el.dataset.name);
  });
});

// 7. Enviar mensagem ao servidor
sendBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text || !currentRoom) return;

  const timestamp = formatTime(new Date());
  const msgData = {
    room: currentRoom,
    text: text,
    userType: currentUser.userType,
    userName: currentUser.userName,
    timestamp: timestamp
  };

  // Emitir evento para o servidor: "send_message"
  socket.emit("send_message", msgData);

  // Limpar input
  inputEl.value = "";
});

// 8. Quando receber mensagem do servidor (de tutor ou de si próprio), exibir no ecrã
socket.on("receive_message", (msgData) => {
  // msgData = { room, text, userType, userName, timestamp }
  // Só exibir se for na sala atual
  if (msgData.room !== currentRoom) return;

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.classList.add(msgData.userType); // “aluno” ou “tutor”

  // Texto da mensagem
  const textEl = document.createElement("span");
  textEl.textContent = `${msgData.userName}: ${msgData.text}`;
  bubble.appendChild(textEl);

  // Timestamp
  const timeEl = document.createElement("span");
  timeEl.classList.add("timestamp");
  timeEl.textContent = msgData.timestamp;
  bubble.appendChild(timeEl);

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
