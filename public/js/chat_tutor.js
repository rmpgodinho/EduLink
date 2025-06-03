// public/js/chat_tutor.js

// Lógica praticamente idêntica à do aluno, mas com “userType: tutor”
const socket = io();
const contactsEls = document.querySelectorAll(".contact");
const chatAvatarEl = document.querySelector(".chat-avatar");
const chatNameEl   = document.querySelector(".chat-user-info h2");
const chatSubEl    = document.querySelector(".chat-user-info p");
const chatMessages = document.querySelector(".chat-messages");
const inputEl      = document.getElementById("message-input");
const sendBtn      = document.getElementById("send-button");

// Informação do utilizador "tutor"
const currentUser = {
  userType: "tutor",
  userName: "Prof. João Silva",
  tutorID: 123
};

let currentRoom = null;

function formatTime(date) {
  const h = date.getHours(), m = date.getMinutes();
  const hh = h < 10 ? "0" + h : h;
  const mm = m < 10 ? "0" + m : m;
  return `${hh}:${mm}`;
}

function loadConversation(room, alunoName) {
  chatAvatarEl.src = "https://via.placeholder.com/80"; // Avatar do aluno
  chatNameEl.textContent = alunoName;
  chatSubEl.textContent = "Estou à disposição para dúvidas!";

  chatMessages.innerHTML = "";

  currentRoom = room;
  socket.emit("join_room", {
    room: room,
    userType: currentUser.userType,
    userName: currentUser.userName
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const selected = document.querySelector(".contact.selected");
  if (selected) {
    loadConversation(selected.dataset.room, selected.dataset.name);
  }
});

contactsEls.forEach(el => {
  el.addEventListener("click", () => {
    document.querySelector(".contact.selected").classList.remove("selected");
    el.classList.add("selected");
    loadConversation(el.dataset.room, el.dataset.name);
  });
});

sendBtn.addEventListener("click", () => {
  const text = inputEl.value.trim();
  if (!text || !currentRoom) return;

  const timestamp = formatTime(new Date());
  const msgData = {
    room: currentRoom,
    text,
    userType: currentUser.userType,
    userName: currentUser.userName,
    timestamp
  };
  socket.emit("send_message", msgData);
  inputEl.value = "";
});

socket.on("receive_message", (msgData) => {
  if (msgData.room !== currentRoom) return;

  const bubble = document.createElement("div");
  bubble.classList.add("bubble");
  bubble.classList.add(msgData.userType); // “tutor” ou “aluno”

  const textEl = document.createElement("span");
  textEl.textContent = `${msgData.userName}: ${msgData.text}`;
  bubble.appendChild(textEl);

  const timeEl = document.createElement("span");
  timeEl.classList.add("timestamp");
  timeEl.textContent = msgData.timestamp;
  bubble.appendChild(timeEl);

  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
