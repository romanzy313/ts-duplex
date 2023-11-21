import { WebSocketClient } from 'ts-duplex/WebSocketClient';
import { AllTypes } from './schema';

const form = document.querySelector('form')! as HTMLFormElement;
const messages = document.querySelector('#messages')! as HTMLUListElement;

// const sendBtn = document.querySelector('#send')! as HTMLButtonElement;
const messageInput = document.querySelector('#message')! as HTMLInputElement;
const usernameInput = document.querySelector('#username')! as HTMLInputElement;

const client = new WebSocketClient<AllTypes>('ws://localhost:3030');

usernameInput.value = crypto.randomUUID().substring(0, 8);

const stopBtn = document.querySelector('#stop')! as HTMLButtonElement;
stopBtn.addEventListener('click', () => {
  //   client.stop();
  client.send('gracefulDisconnect');
});

client.on('newMessage', ({ from, content, time }) => {
  if (from === usernameInput.value) return;
  console.log('new message', from, content);

  const message = `[${new Date(
    time
  ).toLocaleTimeString()}] ${from}: ${content}`;
  const li = document.createElement('li');
  li.innerText = message;

  messages.appendChild(li);
});

client.on('hello', () => {
  const li = document.createElement('b');
  li.innerText = 'Server said hi';

  messages.appendChild(li);
});

form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const content = messageInput.value;
  const from = usernameInput.value;

  console.log('submitted', content, from);

  if (!content) return;

  client.send('sendMessage', {
    as: from,
    content,
  });

  messageInput.value = '';
});
