import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@shared/schema';

export interface AuthenticatedRequest extends Request {
  isAuthenticated: boolean;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const response: ApiResponse = {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authorization header with Bearer token is required'
    };
    return res.status(401).json(response);
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const expectedToken = process.env.MCP_API_KEY;
  
  if (!expectedToken) {
    const response: ApiResponse = {
      success: false,
      error: 'SERVER_ERROR',
      message: 'MCP_API_KEY not configured'
    };
    return res.status(500).json(response);
  }
  
  if (token !== expectedToken) {
    const response: ApiResponse = {
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid API key'
    };
    return res.status(401).json(response);
  }
  
  req.isAuthenticated = true;
  next();
};