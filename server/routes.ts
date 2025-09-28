import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { authMiddleware, AuthenticatedRequest } from "./middleware/auth";
import { GoogleService } from "./services/google";
import { HubSpotService } from "./services/hubspot";
import { logger } from "./utils/logger";
import { ApiResponse, CreateDocumentSchema, CreateSpreadsheetSchema, CreateCalendarEventSchema, CreateContactSchema, CreateCompanySchema, CreateDealSchema } from "@shared/schema";
import { z } from "zod";

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for write operations
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED', 
    message: 'Too many write requests, please try again later'
  } as ApiResponse,
});

const googleService = new GoogleService();
const hubspotService = new HubSpotService();

// Error handler wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: Function) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint (no auth required)
  app.get('/health', (req: Request, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime(),
      },
      message: 'Jarvis MCP Server is running'
    };
    res.json(response);
  });

  // Apply rate limiting and auth to all API routes
  app.use('/api', apiLimiter);
  app.use('/api', authMiddleware);

  // Google Workspace Routes
  
  // Documents
  app.post('/api/google/docs', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateDocumentSchema.parse(req.body);
      const document = await googleService.createDocument(data);
      const response: ApiResponse = {
        success: true,
        data: document,
        message: 'Document created successfully'
      };
      logger.info('Document created', { documentId: document.documentId });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/google/docs/:documentId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const document = await googleService.getDocument(req.params.documentId);
    const response: ApiResponse = {
      success: true,
      data: document
    };
    res.json(response);
  }));

  app.patch('/api/google/docs/:documentId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      const response: ApiResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Content is required and must be a string'
      };
      return res.status(400).json(response);
    }
    
    const document = await googleService.updateDocument(req.params.documentId, content);
    const response: ApiResponse = {
      success: true,
      data: document,
      message: 'Document updated successfully'
    };
    logger.info('Document updated', { documentId: req.params.documentId });
    res.json(response);
  }));

  // Spreadsheets
  app.post('/api/google/sheets', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateSpreadsheetSchema.parse(req.body);
      const spreadsheet = await googleService.createSpreadsheet(data);
      const response: ApiResponse = {
        success: true,
        data: spreadsheet,
        message: 'Spreadsheet created successfully'
      };
      logger.info('Spreadsheet created', { spreadsheetId: spreadsheet.spreadsheetId });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/google/sheets/:spreadsheetId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const spreadsheet = await googleService.getSpreadsheet(req.params.spreadsheetId);
    const response: ApiResponse = {
      success: true,
      data: spreadsheet
    };
    res.json(response);
  }));

  app.patch('/api/google/sheets/:spreadsheetId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { range, values } = req.body;
    if (!range || !values || !Array.isArray(values)) {
      const response: ApiResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Range and values array are required'
      };
      return res.status(400).json(response);
    }
    
    await googleService.updateSpreadsheet(req.params.spreadsheetId, range, values);
    const response: ApiResponse = {
      success: true,
      message: 'Spreadsheet updated successfully'
    };
    logger.info('Spreadsheet updated', { spreadsheetId: req.params.spreadsheetId, range });
    res.json(response);
  }));

  // Drive
  app.get('/api/google/drive/files', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query.q as string;
    const files = await googleService.listFiles(query);
    const response: ApiResponse = {
      success: true,
      data: files
    };
    res.json(response);
  }));

  app.get('/api/google/drive/files/:fileId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const file = await googleService.getFile(req.params.fileId);
    const response: ApiResponse = {
      success: true,
      data: file
    };
    res.json(response);
  }));

  app.delete('/api/google/drive/files/:fileId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await googleService.deleteFile(req.params.fileId);
    const response: ApiResponse = {
      success: true,
      message: 'File deleted successfully'
    };
    logger.info('File deleted', { fileId: req.params.fileId });
    res.json(response);
  }));

  // Calendar
  app.post('/api/google/calendar/events', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateCalendarEventSchema.parse(req.body);
      const event = await googleService.createCalendarEvent(data);
      const response: ApiResponse = {
        success: true,
        data: event,
        message: 'Calendar event created successfully'
      };
      logger.info('Calendar event created', { eventId: event.id });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/google/calendar/events', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const timeMin = req.query.timeMin as string;
    const timeMax = req.query.timeMax as string;
    const events = await googleService.getCalendarEvents(timeMin, timeMax);
    const response: ApiResponse = {
      success: true,
      data: events
    };
    res.json(response);
  }));

  app.delete('/api/google/calendar/events/:eventId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await googleService.deleteCalendarEvent(req.params.eventId);
    const response: ApiResponse = {
      success: true,
      message: 'Calendar event deleted successfully'
    };
    logger.info('Calendar event deleted', { eventId: req.params.eventId });
    res.json(response);
  }));

  // HubSpot Routes
  
  // Contacts
  app.post('/api/hubspot/contacts', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateContactSchema.parse(req.body);
      const contact = await hubspotService.createContact(data);
      const response: ApiResponse = {
        success: true,
        data: contact,
        message: 'Contact created successfully'
      };
      logger.info('Contact created', { contactId: contact.id });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/hubspot/contacts', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const contacts = await hubspotService.listContacts(limit);
    const response: ApiResponse = {
      success: true,
      data: contacts
    };
    res.json(response);
  }));

  app.get('/api/hubspot/contacts/:contactId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contact = await hubspotService.getContact(req.params.contactId);
    const response: ApiResponse = {
      success: true,
      data: contact
    };
    res.json(response);
  }));

  app.patch('/api/hubspot/contacts/:contactId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const contact = await hubspotService.updateContact(req.params.contactId, req.body);
    const response: ApiResponse = {
      success: true,
      data: contact,
      message: 'Contact updated successfully'
    };
    logger.info('Contact updated', { contactId: req.params.contactId });
    res.json(response);
  }));

  app.delete('/api/hubspot/contacts/:contactId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await hubspotService.deleteContact(req.params.contactId);
    const response: ApiResponse = {
      success: true,
      message: 'Contact deleted successfully'
    };
    logger.info('Contact deleted', { contactId: req.params.contactId });
    res.json(response);
  }));

  // Companies
  app.post('/api/hubspot/companies', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateCompanySchema.parse(req.body);
      const company = await hubspotService.createCompany(data);
      const response: ApiResponse = {
        success: true,
        data: company,
        message: 'Company created successfully'
      };
      logger.info('Company created', { companyId: company.id });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/hubspot/companies', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const companies = await hubspotService.listCompanies(limit);
    const response: ApiResponse = {
      success: true,
      data: companies
    };
    res.json(response);
  }));

  app.get('/api/hubspot/companies/:companyId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const company = await hubspotService.getCompany(req.params.companyId);
    const response: ApiResponse = {
      success: true,
      data: company
    };
    res.json(response);
  }));

  app.patch('/api/hubspot/companies/:companyId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const company = await hubspotService.updateCompany(req.params.companyId, req.body);
    const response: ApiResponse = {
      success: true,
      data: company,
      message: 'Company updated successfully'
    };
    logger.info('Company updated', { companyId: req.params.companyId });
    res.json(response);
  }));

  app.delete('/api/hubspot/companies/:companyId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await hubspotService.deleteCompany(req.params.companyId);
    const response: ApiResponse = {
      success: true,
      message: 'Company deleted successfully'
    };
    logger.info('Company deleted', { companyId: req.params.companyId });
    res.json(response);
  }));

  // Deals
  app.post('/api/hubspot/deals', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateDealSchema.parse(req.body);
      const deal = await hubspotService.createDeal(data);
      const response: ApiResponse = {
        success: true,
        data: deal,
        message: 'Deal created successfully'
      };
      logger.info('Deal created', { dealId: deal.id });
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: error.errors.map(e => e.message).join(', ')
        };
        return res.status(400).json(response);
      }
      throw error;
    }
  }));

  app.get('/api/hubspot/deals', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const deals = await hubspotService.listDeals(limit);
    const response: ApiResponse = {
      success: true,
      data: deals
    };
    res.json(response);
  }));

  app.get('/api/hubspot/deals/:dealId', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const deal = await hubspotService.getDeal(req.params.dealId);
    const response: ApiResponse = {
      success: true,
      data: deal
    };
    res.json(response);
  }));

  app.patch('/api/hubspot/deals/:dealId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const deal = await hubspotService.updateDeal(req.params.dealId, req.body);
    const response: ApiResponse = {
      success: true,
      data: deal,
      message: 'Deal updated successfully'
    };
    logger.info('Deal updated', { dealId: req.params.dealId });
    res.json(response);
  }));

  app.delete('/api/hubspot/deals/:dealId', strictLimiter, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await hubspotService.deleteDeal(req.params.dealId);
    const response: ApiResponse = {
      success: true,
      message: 'Deal deleted successfully'
    };
    logger.info('Deal deleted', { dealId: req.params.dealId });
    res.json(response);
  }));

  // Error handling middleware
  app.use((error: any, req: Request, res: Response, next: Function) => {
    logger.error('API Error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: error.code || 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred while processing your request'
        : error.message
    };
    
    res.status(error.status || 500).json(response);
  });

  const httpServer = createServer(app);

  return httpServer;
}
