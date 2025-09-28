# Design Guidelines for Jarvis MCP Backend Server

## Design Approach
**System-Based Approach**: This is a backend API server project with no frontend requirements. However, for any potential documentation or admin interfaces, we'll use a **Utility-Focused Design System** approach prioritizing clarity and functionality over visual appeal.

## Key Design Principles
- **API-First**: JSON-based REST API architecture
- **Security-Focused**: Bearer token authentication and rate limiting
- **Production-Ready**: Comprehensive error handling and monitoring
- **Developer-Friendly**: Clear documentation and OpenAPI specifications

## Technical Architecture Design

### API Structure
- Clean REST endpoints following RESTful conventions
- Consistent JSON response format across all endpoints
- Proper HTTP status codes for different scenarios
- Standardized error response structure

### Authentication Design
- Bearer token authentication via `Authorization: Bearer <MCP_API_KEY>` header
- Middleware-based auth validation
- Secure token handling without exposure in logs

### Error Handling Pattern
- Consistent error response format with error codes
- Proper HTTP status codes (400, 401, 403, 429, 500, etc.)
- Detailed error messages for debugging while maintaining security

### Rate Limiting Strategy
- Per-endpoint rate limiting configuration
- Graceful degradation with proper error responses
- Rate limit headers in responses

## API Documentation Design

### OpenAPI Specification
- Comprehensive `/public/openapi.yaml` file
- Clear endpoint descriptions and parameter definitions
- Example requests and responses
- Authentication requirements clearly documented

### Health Check Design
- Simple `/health` endpoint returning server status
- Include basic system information (uptime, version)
- Proper status codes for monitoring systems

## Integration Architecture

### Google Workspace Integration
- Separate service modules for Docs, Sheets, Drive, Calendar
- OAuth 2.0 refresh token handling
- Proper error handling for Google API limitations

### HubSpot Integration
- Dedicated service for Contacts, Companies, Deals
- Private app token authentication
- Rate limiting aligned with HubSpot API limits

## Environment Configuration Design
- Clear `.env.example` file with all required variables
- Secure secret management practices
- Environment validation on server startup

## Monitoring and Logging
- Structured logging for production debugging
- Request/response logging (excluding sensitive data)
- Performance monitoring hooks

This backend server requires no visual design elements, focusing entirely on API architecture, security, and developer experience.