import { google } from 'googleapis';
import { GoogleDocument, GoogleSpreadsheet, GoogleFile, GoogleCalendarEvent, CreateDocument, CreateSpreadsheet, CreateCalendarEvent } from '@shared/schema';

export class GoogleService {
  private auth: any;

  constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
    
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  // Google Docs operations
  async createDocument(data: CreateDocument): Promise<GoogleDocument> {
    const docs = google.docs({ version: 'v1', auth: this.auth });
    
    const response = await docs.documents.create({
      requestBody: {
        title: data.title,
      },
    });
    
    return response.data as GoogleDocument;
  }

  async getDocument(documentId: string): Promise<GoogleDocument> {
    const docs = google.docs({ version: 'v1', auth: this.auth });
    
    const response = await docs.documents.get({
      documentId,
    });
    
    return response.data as GoogleDocument;
  }

  async updateDocument(documentId: string, content: string): Promise<GoogleDocument> {
    const docs = google.docs({ version: 'v1', auth: this.auth });
    
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });
    
    return this.getDocument(documentId);
  }

  // Google Sheets operations
  async createSpreadsheet(data: CreateSpreadsheet): Promise<GoogleSpreadsheet> {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: data.title,
        },
      },
    });
    
    return response.data as GoogleSpreadsheet;
  }

  async getSpreadsheet(spreadsheetId: string): Promise<GoogleSpreadsheet> {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    
    return response.data as GoogleSpreadsheet;
  }

  async updateSpreadsheet(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });
  }

  // Google Drive operations
  async listFiles(query?: string): Promise<GoogleFile[]> {
    const drive = google.drive({ version: 'v3', auth: this.auth });
    
    const response = await drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,size,modifiedTime)',
      pageSize: 100,
    });
    
    return response.data.files as GoogleFile[];
  }

  async getFile(fileId: string): Promise<GoogleFile> {
    const drive = google.drive({ version: 'v3', auth: this.auth });
    
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,size,modifiedTime',
    });
    
    return response.data as GoogleFile;
  }

  async deleteFile(fileId: string): Promise<void> {
    const drive = google.drive({ version: 'v3', auth: this.auth });
    
    await drive.files.delete({
      fileId,
    });
  }

  // Google Calendar operations
  async createCalendarEvent(data: CreateCalendarEvent): Promise<GoogleCalendarEvent> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: data.summary,
        description: data.description,
        start: {
          dateTime: data.startDateTime,
          timeZone: data.timeZone,
        },
        end: {
          dateTime: data.endDateTime,
          timeZone: data.timeZone,
        },
      },
    });
    
    return response.data as GoogleCalendarEvent;
  }

  async getCalendarEvents(timeMin?: string, timeMax?: string): Promise<GoogleCalendarEvent[]> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax,
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    return response.data.items as GoogleCalendarEvent[];
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.auth });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}