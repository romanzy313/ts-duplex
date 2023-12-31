import http from 'http';
import { WebSocketServer } from 'ws';
import { WsDuplex } from 'ts-duplex/integrations/ws';
import { zodValidator } from 'ts-duplex/validators/zod';
import { type DuplexTypes, Client2Server } from './schema';

const port = 3030;
const server = http.createServer();
server.listen(port, () => {
  console.log('server listening at', `http://localhost:${port}/`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', function (raw) {
  // upgrade default ws into typesafe one and define validators
  const ws = new WsDuplex<DuplexTypes>(raw, {
    Client2Server: zodValidator(Client2Server),
    // Server2Client: zodValidator(Server2Client), // can provide validator here too
  });

  ws.send('hello');

  ws.on('sendMessage', (data) => {
    console.log('got message', data);

    // send to the original sender
    ws.send('newMessage', {
      from: 'me',
      content: data.content,
      time: Date.now(),
    });

    // send to others
    const payload = ws.getSendPayload('newMessage', {
      from: data.as,
      content: data.content,
      time: Date.now(),
    });

    // deploy payload to everyone
    if (payload)
      wss.clients.forEach((c) => {
        c.send(payload);
      });
  });

  // just for sake of example
  ws.on('gracefulDisconnect', () => {
    setTimeout(() => {
      raw.close(1000, 'graceful shutdown');
    }, 2000);
  });
});
