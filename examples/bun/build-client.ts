// build the client

const res = await Bun.build({
  entrypoints: ['./src/client.ts'],
  outdir: 'src',
  target: 'browser',
});

if (!res.success) {
  console.error('failed to build client', res);

  process.exit(1);
}
