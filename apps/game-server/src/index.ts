import { createServer } from 'node:http';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { Server as SocketIOServer } from 'socket.io';
import { SimulationServer } from './simulation/SimulationServer';

const fastify = Fastify({ logger: true });

async function start() {
  await fastify.register(cors, {
    origin: '*',
  });

  const simulation = new SimulationServer();
  simulation.start();

  // Basic API routes
  fastify.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  });

  fastify.get('/api/state', async () => {
    return {
      farm: simulation.farmState,
      buildings: simulation.buildings,
      services: simulation.serviceManager.getAllServices(),
    };
  });

  // Attach Socket.IO
  const server = createServer(fastify.server);
  const io = new SocketIOServer(server, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    fastify.log.info(`[Socket.IO] Client connected: ${socket.id}`);

    // Send initial snapshot
    socket.emit('state:sync', {
      farm: simulation.farmState,
      buildings: simulation.buildings,
      services: simulation.serviceManager.getAllServices(),
    });

    socket.on('disconnect', () => {
      fastify.log.info(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Broadcast state tick every 2 seconds to connected clients
  setInterval(() => {
    io.emit('state:tick', {
      farm: simulation.farmState,
      buildings: simulation.buildings,
    });
  }, 2000);

  const PORT = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 4000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Solar Grove Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
