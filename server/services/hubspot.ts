import { Client } from '@hubspot/api-client';
import { HubSpotContact, HubSpotCompany, HubSpotDeal, CreateContact, CreateCompany, CreateDeal } from '@shared/schema';

export class HubSpotService {
  private client: Client;

  constructor() {
    this.client = new Client({
      accessToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
    });
  }

  // Contact operations
  async createContact(data: CreateContact): Promise<HubSpotContact> {
    const properties: any = {};
    if (data.firstname) properties.firstname = data.firstname;
    if (data.lastname) properties.lastname = data.lastname;
    if (data.email) properties.email = data.email;
    if (data.phone) properties.phone = data.phone;
    if (data.company) properties.company = data.company;

    const response = await this.client.crm.contacts.basicApi.create({
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async getContact(contactId: string): Promise<HubSpotContact> {
    const response = await this.client.crm.contacts.basicApi.getById(
      contactId,
      ['firstname', 'lastname', 'email', 'phone', 'company']
    );

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async listContacts(limit = 100): Promise<HubSpotContact[]> {
    const response = await this.client.crm.contacts.basicApi.getPage(
      limit,
      undefined,
      ['firstname', 'lastname', 'email', 'phone', 'company']
    );

    return response.results.map(contact => ({
      id: contact.id!,
      properties: contact.properties,
      createdAt: contact.createdAt!,
      updatedAt: contact.updatedAt!,
    }));
  }

  async updateContact(contactId: string, data: Partial<CreateContact>): Promise<HubSpotContact> {
    const properties: any = {};
    if (data.firstname !== undefined) properties.firstname = data.firstname;
    if (data.lastname !== undefined) properties.lastname = data.lastname;
    if (data.email !== undefined) properties.email = data.email;
    if (data.phone !== undefined) properties.phone = data.phone;
    if (data.company !== undefined) properties.company = data.company;

    const response = await this.client.crm.contacts.basicApi.update(contactId, {
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.client.crm.contacts.basicApi.archive(contactId);
  }

  // Company operations
  async createCompany(data: CreateCompany): Promise<HubSpotCompany> {
    const properties: any = {};
    if (data.name) properties.name = data.name;
    if (data.domain) properties.domain = data.domain;
    if (data.industry) properties.industry = data.industry;
    if (data.city) properties.city = data.city;
    if (data.state) properties.state = data.state;

    const response = await this.client.crm.companies.basicApi.create({
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async getCompany(companyId: string): Promise<HubSpotCompany> {
    const response = await this.client.crm.companies.basicApi.getById(
      companyId,
      ['name', 'domain', 'industry', 'city', 'state']
    );

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async listCompanies(limit = 100): Promise<HubSpotCompany[]> {
    const response = await this.client.crm.companies.basicApi.getPage(
      limit,
      undefined,
      ['name', 'domain', 'industry', 'city', 'state']
    );

    return response.results.map(company => ({
      id: company.id!,
      properties: company.properties,
      createdAt: company.createdAt!,
      updatedAt: company.updatedAt!,
    }));
  }

  async updateCompany(companyId: string, data: Partial<CreateCompany>): Promise<HubSpotCompany> {
    const properties: any = {};
    if (data.name !== undefined) properties.name = data.name;
    if (data.domain !== undefined) properties.domain = data.domain;
    if (data.industry !== undefined) properties.industry = data.industry;
    if (data.city !== undefined) properties.city = data.city;
    if (data.state !== undefined) properties.state = data.state;

    const response = await this.client.crm.companies.basicApi.update(companyId, {
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async deleteCompany(companyId: string): Promise<void> {
    await this.client.crm.companies.basicApi.archive(companyId);
  }

  // Deal operations
  async createDeal(data: CreateDeal): Promise<HubSpotDeal> {
    const properties: any = {};
    if (data.dealname) properties.dealname = data.dealname;
    if (data.amount) properties.amount = data.amount;
    if (data.dealstage) properties.dealstage = data.dealstage;
    if (data.closedate) properties.closedate = data.closedate;

    const response = await this.client.crm.deals.basicApi.create({
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async getDeal(dealId: string): Promise<HubSpotDeal> {
    const response = await this.client.crm.deals.basicApi.getById(
      dealId,
      ['dealname', 'amount', 'dealstage', 'closedate']
    );

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async listDeals(limit = 100): Promise<HubSpotDeal[]> {
    const response = await this.client.crm.deals.basicApi.getPage(
      limit,
      undefined,
      ['dealname', 'amount', 'dealstage', 'closedate']
    );

    return response.results.map(deal => ({
      id: deal.id!,
      properties: deal.properties,
      createdAt: deal.createdAt!,
      updatedAt: deal.updatedAt!,
    }));
  }

  async updateDeal(dealId: string, data: Partial<CreateDeal>): Promise<HubSpotDeal> {
    const properties: any = {};
    if (data.dealname !== undefined) properties.dealname = data.dealname;
    if (data.amount !== undefined) properties.amount = data.amount;
    if (data.dealstage !== undefined) properties.dealstage = data.dealstage;
    if (data.closedate !== undefined) properties.closedate = data.closedate;

    const response = await this.client.crm.deals.basicApi.update(dealId, {
      properties,
    });

    return {
      id: response.id!,
      properties: response.properties,
      createdAt: response.createdAt!,
      updatedAt: response.updatedAt!,
    };
  }

  async deleteDeal(dealId: string): Promise<void> {
    await this.client.crm.deals.basicApi.archive(dealId);
  }
}