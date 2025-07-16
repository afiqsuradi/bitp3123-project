import express, { Request, Response, NextFunction } from 'express';
import { config, configService } from './config';
import Routes from './startup/routes';

const app = express();
const routes = new Routes(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
routes.registerRoutes();

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);

  if (configService.isDevelopment()) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
    });
  } else {
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`Server is running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();