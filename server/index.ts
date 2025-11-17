import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { ApolloServer } from '@apollo/server';
import { createServer } from 'http';
import { config } from './config';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { initializeWebSocket } from './websocket';
import { startDomainGenerationJob } from './jobs/domainGeneration';
import routes from './routes';
import { apiLimiter } from './middleware/rateLimit';
import { verifyToken } from './utils/jwt';

async function startServer() {
  const app = express();
  
  // Create HTTP server
  const httpServer = createServer(app);

  // Middleware
  app.use(helmet({
    contentSecurityPolicy: config.nodeEnv === 'production',
  }));
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
  }));
  app.use(compression());
  app.use(morgan(config.nodeEnv === 'development' ? 'dev' : 'combined'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use('/api', apiLimiter);

  // Connect to database and Redis
  await connectDatabase();
  connectRedis();

  // REST API routes
  app.use('/api', routes);

  // Initialize Apollo Server for GraphQL
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  // GraphQL endpoint with manual context extraction
  app.post('/graphql', async (req: express.Request, res: express.Response) => {
    const authHeader = req.headers.authorization;
    let user;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        user = verifyToken(token);
      } catch {
        // Invalid token, user remains undefined
      }
    }

    try {
      const response = await apolloServer.executeOperation(
        {
          query: req.body.query,
          variables: req.body.variables,
          operationName: req.body.operationName,
        },
        {
          contextValue: { user },
        }
      );

      if (response.body.kind === 'single') {
        res.status(200).json(response.body.singleResult);
      } else {
        res.status(200).send('Incremental delivery not supported');
      }
    } catch (error) {
      res.status(500).json({ errors: [{ message: 'Internal server error' }] });
    }
  });

  // Initialize WebSocket
  initializeWebSocket(httpServer);

  // Start cron jobs
  startDomainGenerationJob();

  // Error handling
  app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({
      error: config.nodeEnv === 'development' ? 'Internal server error' : 'Internal server error',
    });
  });

  // Start server
  httpServer.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 News Domain Generator Server                    ║
║                                                       ║
║   Environment: ${config.nodeEnv.padEnd(36)}║
║   Port: ${String(config.port).padEnd(42)}║
║   REST API: http://localhost:${config.port}/api${' '.repeat(16)}║
║   GraphQL: http://localhost:${config.port}/graphql${' '.repeat(14)}║
║   WebSocket: ws://localhost:${config.port}/ws${' '.repeat(17)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing server');
  process.exit(0);
});

// Start the server
startServer().catch(() => {
  console.error('Failed to start server');
  process.exit(1);
});
