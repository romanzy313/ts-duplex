/* eslint-disable no-undef */

import express from 'express';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import http from 'http';
import { WsDuplex } from 'ts-duplex/integrations/ws';
import { AllTypes, Client2Server, Server2Client } from './schema';
import { zodValidator } from 'ts-duplex/validators/zod';
const port = 3030;

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

const server = http.createServer();
server.listen(port, () => {
  console.log('server listening at', `http://localhost:${port}/`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', function (_ws) {
  // ...

  const ws = new WsDuplex<AllTypes>(_ws, {
    Client2Server: zodValidator(Client2Server),
    Server2Client: zodValidator(Server2Client),
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

  // just for example
  ws.on('gracefulDisconnect', () => {
    setTimeout(() => {
      _ws.close(1000, 'graceful shutdown');
    }, 2000);
  });
});
