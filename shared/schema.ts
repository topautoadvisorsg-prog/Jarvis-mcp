import { z } from "zod";

// API Response schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Google Workspace schemas
export const GoogleDocumentSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  body: z.object({
    content: z.array(z.any()),
  }),
});

export const GoogleSpreadsheetSchema = z.object({
  spreadsheetId: z.string(),
  properties: z.object({
    title: z.string(),
  }),
  sheets: z.array(z.any()),
});

export const GoogleFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.string().optional(),
  modifiedTime: z.string(),
});

export const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
  }),
});

// HubSpot schemas
export const HubSpotContactSchema = z.object({
  id: z.string(),
  properties: z.object({
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const HubSpotCompanySchema = z.object({
  id: z.string(),
  properties: z.object({
    name: z.string().optional(),
    domain: z.string().optional(),
    industry: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const HubSpotDealSchema = z.object({
  id: z.string(),
  properties: z.object({
    dealname: z.string().optional(),
    amount: z.string().optional(),
    dealstage: z.string().optional(),
    closedate: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Request schemas
export const CreateDocumentSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CreateSpreadsheetSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const CreateCalendarEventSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  description: z.string().optional(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  timeZone: z.string().default("UTC"),
});

export const CreateContactSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export const CreateCompanySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  domain: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const CreateDealSchema = z.object({
  dealname: z.string().min(1, "Deal name is required"),
  amount: z.string().optional(),
  dealstage: z.string().optional(),
  closedate: z.string().optional(),
});

export type GoogleDocument = z.infer<typeof GoogleDocumentSchema>;
export type GoogleSpreadsheet = z.infer<typeof GoogleSpreadsheetSchema>;
export type GoogleFile = z.infer<typeof GoogleFileSchema>;
export type GoogleCalendarEvent = z.infer<typeof GoogleCalendarEventSchema>;
export type HubSpotContact = z.infer<typeof HubSpotContactSchema>;
export type HubSpotCompany = z.infer<typeof HubSpotCompanySchema>;
export type HubSpotDeal = z.infer<typeof HubSpotDealSchema>;
export type CreateDocument = z.infer<typeof CreateDocumentSchema>;
export type CreateSpreadsheet = z.infer<typeof CreateSpreadsheetSchema>;
export type CreateCalendarEvent = z.infer<typeof CreateCalendarEventSchema>;
export type CreateContact = z.infer<typeof CreateContactSchema>;
export type CreateCompany = z.infer<typeof CreateCompanySchema>;
export type CreateDeal = z.infer<typeof CreateDealSchema>;
