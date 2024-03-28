import { getQueryParams } from './query-param.js'
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');

// Get username and room from URL
const { username, room } = getQueryParams(location.search)

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');

  const header = document.createElement('div');
  header.classList.add('meta');
  div.appendChild(header);

  const usernameSpan = document.createElement('span');
  usernameSpan.classList.add('username');
  usernameSpan.textContent = sanitize(message.username);
  header.appendChild(usernameSpan);

  const timeSpan = document.createElement('time');
  timeSpan.classList.add('time');
  timeSpan.textContent = sanitize(message.time);
  header.appendChild(timeSpan);

  const para = document.createElement('p');
  para.classList.add('text');
  para.textContent = sanitize(message.text);
  div.appendChild(para);

  chatMessages.appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// basic sanitazion
function sanitize(input) {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Add users to DOM
function outputUsers(users) {
  const userList = document.getElementById('users');

  // Remove only child nodes that are list items
  [...userList.children].filter(child => child.tagName === 'LI').forEach(child => child.remove());

  users.forEach((user) => {
    const li = document.createElement('li');
    li.textContent = sanitize(user.username);
    userList.appendChild(li);
  });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
