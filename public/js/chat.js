const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit('chat_message', chatInput.value);
    chatInput.value = '';
  }
});

socket.on('chat_message', ({ teamName, message }) => {
  const messageElement = document.createElement('div');
  messageElement.classList.add('chat-message');
  messageElement.innerHTML = `<strong>${teamName}:</strong> ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
