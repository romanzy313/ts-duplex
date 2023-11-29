import { bunWebSocketHandler } from 'ts-duplex/integrations/bun';
import { AllTypes } from './schema';

// that object will hook into it
// tsBun.websocket

const port = 3031;

const server = Bun.serve({
  port,
  fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname == '/') return new Response(Bun.file('./src/index.html'));
    if (pathname == '/client.js')
      return new Response(Bun.file('./src/client.js'));
    if (pathname == '/ws') {
      console.log('websocket request');

      const success = server.upgrade(request);
      if (success) {
        console.log('upgrade success');

        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }
    }

    return new Response('404 not found ' + pathname, {
      status: 404,
    });
  },
  websocket: bunWebSocketHandler<AllTypes>({}, (ws) => {
    // forwards all the messages when ws.ctx.publish is called
    // ctx in this case is the original bun socket object
    ws.ctx.subscribe('global-msg');
    ws.send('hello');

    // console.log('hello');

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

      if (payload) ws.ctx.publish(`global-msg`, payload);
    });

    // just for sake of example
    ws.on('gracefulDisconnect', () => {
      setTimeout(() => {
        ws.ctx.close(1000, 'graceful shutdown');
      }, 2000);
    });
  }),
});

console.log(`Listening on localhost:${server.port}`);
