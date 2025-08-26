import server from '@/server';

const start = async () => {
  try {
    await server.ready();
    const port = +server.config.API_PORT;
    const host = server.config.API_HOST;
    console.log(`Server is running at http://${host}:${port}`);
    console.log(`Documentation available at http://${host}:${port}/public/readme`);
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
