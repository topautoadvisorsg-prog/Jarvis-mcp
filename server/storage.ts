// This MCP backend server doesn't require persistent storage
// All operations are handled through external APIs (Google, HubSpot)
export interface IStorage {
  // Placeholder interface - no storage needed for MCP server
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for MCP server
  }
}

export const storage = new MemStorage();
