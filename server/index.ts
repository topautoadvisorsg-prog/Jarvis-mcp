import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { logger } from "./utils/logger";
import helmet from "helmet";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment validation
const requiredEnvVars = [
  'MCP_API_KEY',
  'GOOGLE_CLIENT_ID', 
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'HUBSPOT_PRIVATE_APP_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  logger.error('Please check your .env file or environment configuration');
  // Don't exit in development to allow testing without all credentials
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    logger.warn('Running in development mode without all credentials - some endpoints may not work');
  }
}

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow swagger UI to load
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Serve OpenAPI spec and documentation
app.use('/public', express.static(path.join(__dirname, '../public')));

// Load OpenAPI spec from YAML file
const openApiPath = path.join(__dirname, '../public/openapi.yaml');
if (fs.existsSync(openApiPath)) {
  try {
    const swaggerDocument = YAML.load(openApiPath);
    
    // Swagger UI
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Jarvis MCP Server API Documentation'
    }));
    
    logger.info('API documentation available at /docs');
  } catch (error) {
    logger.error('Failed to load OpenAPI specification:', error);
  }
} else {
  logger.warn('OpenAPI specification file not found');
}

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  const port = parseInt(process.env.PORT || '5000', 10);
  
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info(`🚀 Jarvis MCP Server started successfully`);
    logger.info(`📡 Server running on all interfaces at port ${port}`);
    logger.info(`🏥 Health check: http://localhost:${port}/health`);
    logger.info(`📚 API Documentation: http://localhost:${port}/docs`);
    logger.info(`📄 OpenAPI Spec: http://localhost:${port}/public/openapi.yaml`);
    
    if (process.env.NODE_ENV === 'production') {
      logger.info('🔒 Running in production mode');
    } else {
      logger.info('🔧 Running in development mode');
    }
    
    logger.info('✅ Jarvis MCP Server ready to handle requests');
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
})();
