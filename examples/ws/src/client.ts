import { WebSocketClient } from 'ts-duplex/WebSocketClient';
import type { DuplexTypes } from './schema';

const form = document.querySelector('form')! as HTMLFormElement;
const messages = document.querySelector('#messages')! as HTMLUListElement;
const messageInput = document.querySelector('#message')! as HTMLInputElement;
const usernameInput = document.querySelector('#username')! as HTMLInputElement;
const stopBtn = document.querySelector('#stop')! as HTMLButtonElement;

usernameInput.value = crypto.randomUUID().substring(0, 8);

const client = new WebSocketClient<DuplexTypes>('ws://localhost:3030');

client.onConnectionStateChanged((state) => {
  console.log('connection changed', state);
});

const off = client.on('*', (topic, data) => {
  console.log(`[${topic}]`, data);
});

setTimeout(() => {
  console.log('offed star sub');

  off();
}, 5000);

client.on('newMessage', ({ from, content, time }) => {
  if (from === usernameInput.value) return;
  console.log('got message', content);

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

  if (!content) return;

  client.send('sendMessage', {
    as: from,
    content,
  });

  messageInput.value = '';
});

stopBtn.addEventListener('click', () => {
  client.send('gracefulDisconnect');
});
