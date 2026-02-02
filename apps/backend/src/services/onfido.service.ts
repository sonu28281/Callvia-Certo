import Fastify from 'fastify';
import axios from 'axios';

const ONFIDO_API_URL = 'https://api.onfido.com/v3.6';

/**
 * Onfido KYC Provider Integration
 * 
 * Features:
 * - Document verification (Passport, ID, Driver's License)
 * - Facial biometric verification
 * - Liveness detection
 * - AML & Watchlist screening
 */

interface OnfidoApplicant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface OnfidoSDKToken {
  applicant_id: string;
  token: string;
  expires_at: string;
}

interface OnfidoCheck {
  id: string;
  status: 'in_progress' | 'awaiting_applicant' | 'complete' | 'withdrawn';
  result: 'clear' | 'consider' | 'unidentified' | null;
  reports: OnfidoReport[];
}

interface OnfidoReport {
  id: string;
  name: 'document' | 'facial_similarity_photo' | 'watchlist_aml';
  status: 'complete' | 'awaiting_data' | 'in_progress' | 'withdrawn';
  result: 'clear' | 'consider' | 'unidentified' | null;
  properties: Record<string, any>;
}

class OnfidoProvider {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = ONFIDO_API_URL;
  }

  private getHeaders() {
    return {
      Authorization: `Token token=${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Step 1: Create Applicant
   * Creates a new applicant in Onfido system
   */
  async createApplicant(
    firstName: string,
    lastName: string,
    email: string
  ): Promise<OnfidoApplicant> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/applicants`,
        {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Onfido create applicant error:', error.response?.data);
      throw new Error(`Failed to create applicant: ${error.message}`);
    }
  }

  /**
   * Step 2: Generate SDK Token
   * Creates a token for the end user to access Onfido SDK
   */
  async generateSDKToken(applicantId: string): Promise<OnfidoSDKToken> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/sdk_token`,
        {
          applicant_id: applicantId,
          referrer: '*://*/*', // Allow all domains (restrict in production)
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Onfido SDK token error:', error.response?.data);
      throw new Error(`Failed to generate SDK token: ${error.message}`);
    }
  }

  /**
   * Step 3: Create Check
   * Initiates the verification process after documents are uploaded
   */
  async createCheck(
    applicantId: string,
    reportTypes: string[] = ['document', 'facial_similarity_photo']
  ): Promise<OnfidoCheck> {
    try {
      const reports = reportTypes.map((name) => ({ name }));

      const response = await axios.post(
        `${this.apiUrl}/checks`,
        {
          applicant_id: applicantId,
          report_names: reportTypes,
        },
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Onfido create check error:', error.response?.data);
      throw new Error(`Failed to create check: ${error.message}`);
    }
  }

  /**
   * Step 4: Get Check Status
   * Retrieves the current status of a verification check
   */
  async getCheck(checkId: string): Promise<OnfidoCheck> {
    try {
      const response = await axios.get(`${this.apiUrl}/checks/${checkId}`, {
        headers: this.getHeaders(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Onfido get check error:', error.response?.data);
      throw new Error(`Failed to get check: ${error.message}`);
    }
  }

  /**
   * Get Applicant Details
   */
  async getApplicant(applicantId: string): Promise<OnfidoApplicant> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/applicants/${applicantId}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error: any) {
      console.error('Onfido get applicant error:', error.response?.data);
      throw new Error(`Failed to get applicant: ${error.message}`);
    }
  }

  /**
   * Download Document
   */
  async downloadDocument(documentId: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/documents/${documentId}/download`,
        {
          headers: this.getHeaders(),
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      console.error('Onfido download document error:', error.response?.data);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  /**
   * Webhook Handler
   * Processes Onfido webhook events
   */
  async handleWebhook(payload: any): Promise<void> {
    const { resource_type, action, object } = payload;

    console.log('Onfido webhook received:', {
      resource_type,
      action,
      object_id: object?.id,
      object_status: object?.status,
      object_result: object?.result,
    });

    // TODO: Update database with check results
    // TODO: Notify admin via email/SMS
    // TODO: Update audit logs
  }
}

export default OnfidoProvider;

// TODO: Replace with actual Onfido API key from environment
export const onfidoProvider = new OnfidoProvider(
  process.env.ONFIDO_API_KEY || 'test_api_key'
);
