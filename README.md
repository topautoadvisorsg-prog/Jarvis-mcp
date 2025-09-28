<<<<<<< HEAD
# Jarvis

This is the starting point for the `Jarvis` backend agent, designed for deployment via [RIPLET AI](https://www.riplet.ai/).

## Overview

This project will expose a secure REST API to interact with external services such as Google Workspace and HubSpot CRM. Deployment is handled through RIPLET AI for ease of testing and public endpoint generation.

More info coming soon.
=======
# Jarvis MCP Server

A production-ready Express.js backend server that exposes REST API endpoints for Google Workspace and HubSpot integrations. This server allows ChatGPT (via Actions) to interact with Google Docs, Sheets, Drive, Calendar, and HubSpot Contacts, Companies, and Deals through secure endpoints.

## 🚀 Features

- **Google Workspace Integration**: Docs, Sheets, Drive, and Calendar operations
- **HubSpot Integration**: Contacts, Companies, and Deals management
- **Bearer Token Authentication**: Secure API access with `MCP_API_KEY`
- **Rate Limiting**: Protection against API abuse
- **Comprehensive Error Handling**: Proper HTTP status codes and error messages
- **OpenAPI Specification**: Complete API documentation
- **Production Security**: Helmet middleware, CORS configuration, request logging
- **Health Check Endpoint**: Monitor server status

## 📦 API Endpoints

### Core Endpoints
- `GET /health` - Health check (no auth required)
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /public/openapi.yaml` - OpenAPI specification file

### Google Workspace
- **Documents**: `POST/GET/PATCH /api/google/docs`
- **Spreadsheets**: `POST/GET/PATCH /api/google/sheets`
- **Drive**: `GET/DELETE /api/google/drive/files`
- **Calendar**: `GET/POST/DELETE /api/google/calendar/events`

### HubSpot
- **Contacts**: `GET/POST/PATCH/DELETE /api/hubspot/contacts`
- **Companies**: `GET/POST/PATCH/DELETE /api/hubspot/companies`  
- **Deals**: `GET/POST/PATCH/DELETE /api/hubspot/deals`

## 🔧 Environment Setup

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your environment variables in `.env`:
```env
# MCP API Configuration
MCP_API_KEY=your_secure_api_key_here
PORT=5000

# Google Workspace API Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# HubSpot API Configuration
HUBSPOT_PRIVATE_APP_TOKEN=your_hubspot_token

# Environment
NODE_ENV=production
```

## 🔐 Getting API Credentials

### Google Workspace
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Workspace APIs (Docs, Sheets, Drive, Calendar)
4. Create OAuth 2.0 credentials
5. Generate a refresh token using the Google OAuth playground

### HubSpot
1. Go to your HubSpot account settings
2. Navigate to Integrations > Private Apps
3. Create a new private app with the required scopes:
   - `crm.objects.contacts.read/write`
   - `crm.objects.companies.read/write`
   - `crm.objects.deals.read/write`

## 🚀 Deployment & Usage

### Start the Server
```bash
npm run dev
```

The server will start on port 5000 and provide:
- 🏥 Health check: `http://localhost:5000/health`
- 📚 API docs: `http://localhost:5000/docs`
- 📄 OpenAPI spec: `http://localhost:5000/public/openapi.yaml`

### Public URL
After deployment on Replit, your public URL will be:
```
https://your-repl-name.your-username.repl.co
```

### Test the Server
```bash
# Health check
curl https://your-deployment-url.replit.app/health

# API call (with authentication)
curl -H "Authorization: Bearer YOUR_MCP_API_KEY" \
     https://your-deployment-url.replit.app/api/google/drive/files
```

## 🔗 ChatGPT Actions Integration

1. In ChatGPT, go to your GPT configuration
2. Add an Action with this OpenAPI URL:
```
https://your-deployment-url.replit.app/public/openapi.yaml
```

3. Configure authentication:
   - **Type**: Bearer Token
   - **Token**: Your `MCP_API_KEY`

4. Test the integration by asking ChatGPT to:
   - "List my Google Drive files"
   - "Create a new document called 'Meeting Notes'"
   - "Show my HubSpot contacts"

## 📊 Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Write Operations**: 10 requests per 15 minutes per IP

## 🔒 Security Features

- Bearer token authentication on all `/api` endpoints
- Helmet.js security headers
- CORS configuration
- Request logging and monitoring
- Input validation with Zod schemas
- Error handling without data leakage

## 🐛 Troubleshooting

### Server Won't Start
1. Check that all required environment variables are set
2. Verify Google and HubSpot credentials are valid
3. Check the logs for specific error messages

### API Calls Fail
1. Verify the `Authorization: Bearer <MCP_API_KEY>` header is included
2. Check that the API key matches your `MCP_API_KEY` environment variable
3. Review the API documentation at `/docs` for correct request format

### Google API Errors
1. Ensure your Google credentials have the required scopes
2. Check that the APIs are enabled in Google Cloud Console
3. Verify your refresh token is still valid

### HubSpot API Errors
1. Check that your private app has the required scopes
2. Verify the token is active and not expired
3. Ensure you're using the correct HubSpot account

## 📈 Monitoring

The server provides comprehensive logging:
- Request/response logging with timing
- Error logging with stack traces
- Health check endpoint for uptime monitoring
- Graceful shutdown handling

## 🔄 Redeployment

To redeploy with new environment variables:
1. Update your `.env` file
2. Restart the application
3. Test the `/health` endpoint
4. Verify API functionality with a test request

Your Jarvis MCP Server is now ready to power your ChatGPT Actions with Google Workspace and HubSpot integrations! 🎉
>>>>>>> 82e537b (Add comprehensive documentation for the Jarvis MCP backend server)
