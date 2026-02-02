/**
 * DigiLocker Integration Service
 * 
 * DigiLocker is a Government of India initiative to provide digital document storage
 * and sharing. This service implements OAuth 2.0 flow and Pull API integration.
 * 
 * Official Documentation: https://digilocker.meity.gov.in/
 */

import crypto from 'crypto';

interface DigiLockerConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authEndpoint: string;
  tokenEndpoint: string;
  pullApiEndpoint: string;
  mockMode?: boolean; // Enable demo mode without real API keys
}

interface DigiLockerAuthResponse {
  code: string;
  state: string;
}

interface DigiLockerTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface DigiLockerDocument {
  uri: string;
  doctype: string;
  name: string;
  size: string;
  date: string;
  issuer: {
    name: string;
    id: string;
  };
}

interface AadhaarData {
  uid: string; // Masked Aadhaar (XXXX-XXXX-1234)
  name: string;
  dob: string;
  gender: string;
  address: {
    house: string;
    street: string;
    landmark: string;
    locality: string;
    vtc: string;
    subdist: string;
    dist: string;
    state: string;
    country: string;
    pincode: string;
  };
  photo: string; // Base64 encoded
}

class DigiLockerService {
  private config: DigiLockerConfig;

  constructor() {
    // Initialize with environment variables
    const clientId = process.env.DIGILOCKER_CLIENT_ID || '';
    const mockMode = !clientId || clientId === '' || process.env.DIGILOCKER_MOCK_MODE === 'true';
    
    this.config = {
      clientId,
      clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || '',
      redirectUri: process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:5173/kyc/digilocker/callback',
      authEndpoint: 'https://digilocker.meity.gov.in/public/oauth2/1/authorize',
      tokenEndpoint: 'https://digilocker.meity.gov.in/public/oauth2/1/token',
      pullApiEndpoint: 'https://digilocker.meity.gov.in/public/oauth2/2/file',
      mockMode,
    };
    
    if (mockMode) {
      console.log('🎭 DigiLocker Mock Mode ENABLED (no API keys configured)');
    }
  }

  /**
   * Generate mock KYC data for testing
   */
  private generateMockKycData(): any {
    return {
      name: 'Demo User',
      dob: '01-01-1990',
      gender: 'M',
      phone: '+91-9999999999',
      email: 'demo@example.com',
      aadhaarMasked: 'XXXX-XXXX-1234',
      address: {
        house: 'Demo House',
        street: 'Demo Street',
        landmark: 'Near Demo Place',
        locality: 'Demo Locality',
        city: 'Demo City',
        district: 'Demo District',
        state: 'Demo State',
        country: 'India',
        pincode: '110001',
      },
      photo: '/9j/4AAQSkZJRgABAQEAYABgAAD/', // Sample base64 (placeholder)
    };
  }

  /**
   * Generate OAuth authorization URL
   * User will be redirected to DigiLocker for login and consent
   */
  generateAuthUrl(sessionId: string): string {
    if (this.config.mockMode) {
      // Return mock URL that indicates demo mode
      return `/kyc/digital/digilocker/mock?sessionId=${sessionId}`;
    }
    
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in session for verification later
    // In production, store in Redis/database with expiry
    
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state: `${state}:${sessionId}`, // Include session ID in state
    });

    return `${this.config.authEndpoint}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<DigiLockerTokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
    });

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DigiLocker token exchange failed: ${error}`);
    }

    const result: any = await response.json();
    return result as DigiLockerTokenResponse;
  }

  /**
   * Get list of issued documents from user's DigiLocker
   */
  async getIssuedDocuments(accessToken: string): Promise<DigiLockerDocument[]> {
    const response = await fetch(`${this.config.pullApiEndpoint}/issued`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch DigiLocker documents');
    }

    const data: any = await response.json();
    return data.items || [];
  }

  /**
   * Download specific document from DigiLocker
   */
  async downloadDocument(accessToken: string, documentUri: string): Promise<Buffer> {
    const params = new URLSearchParams({
      uri: documentUri,
    });

    const response = await fetch(`${this.config.pullApiEndpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download document from DigiLocker');
    }

    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Parse Aadhaar XML to extract demographic data
   * Aadhaar XML is returned in encrypted format - needs decryption
   */
  parseAadhaarXml(xmlString: string): AadhaarData {
    // Note: In production, implement proper XML parsing with xml2js
    // This is a simplified version
    
    // Extract data using regex (for demo purposes)
    // In production, use proper XML parser
    const uidMatch = xmlString.match(/uid="([^"]+)"/);
    const nameMatch = xmlString.match(/name="([^"]+)"/);
    const dobMatch = xmlString.match(/dob="([^"]+)"/);
    const genderMatch = xmlString.match(/gender="([^"]+)"/);

    return {
      uid: uidMatch ? uidMatch[1] : '',
      name: nameMatch ? nameMatch[1] : '',
      dob: dobMatch ? dobMatch[1] : '',
      gender: genderMatch ? genderMatch[1] : '',
      address: {
        house: '',
        street: '',
        landmark: '',
        locality: '',
        vtc: '',
        subdist: '',
        dist: '',
        state: '',
        country: 'India',
        pincode: '',
      },
      photo: '', // Base64 encoded photo
    };
  }

  /**
   * Verify PAN card using NSDL API or third-party provider
   */
  async verifyPAN(panNumber: string, name: string, dob: string): Promise<{
    valid: boolean;
    name: string;
    category: string;
    status: string;
  }> {
    // TODO: Integrate with actual PAN verification API
    // Options:
    // 1. NSDL PAN API (official)
    // 2. Third-party: IDfy, Signzy, Karza
    
    // For now, return mock response
    console.log(`Verifying PAN: ${panNumber} for ${name}, DOB: ${dob}`);

    // In production, call actual API:
    // const response = await fetch('https://api.provider.com/verify-pan', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.PAN_API_KEY}` },
    //   body: JSON.stringify({ pan: panNumber, name, dob })
    // });

    return {
      valid: true,
      name: name.toUpperCase(),
      category: 'Individual',
      status: 'Valid',
    };
  }

  /**
   * Mask Aadhaar number for storage (UIDAI regulation)
   * Only last 4 digits should be visible
   */
  maskAadhaar(aadhaarNumber: string): string {
    // Format: XXXX-XXXX-1234
    return `XXXX-XXXX-${aadhaarNumber.slice(-4)}`;
  }

  /**
   * Validate state parameter for CSRF protection
   */
  validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }

  /**
   * Generate Virtual ID (VID) request
   * VID is recommended over Aadhaar number for privacy
   */
  async requestVID(aadhaarNumber: string): Promise<{ vid: string }> {
    // TODO: Integrate with UIDAI VID generation API
    // This requires AUA license
    
    return {
      vid: `${Math.random().toString().slice(2, 18)}`, // 16-digit VID
    };
  }

  /**
   * Comprehensive KYC verification using DigiLocker
   * Returns all verified documents and demographic data
   */
  async performDigiLockerKYC(accessToken: string): Promise<{
    aadhaar: AadhaarData | null;
    pan: any | null;
    drivingLicense: any | null;
    documents: DigiLockerDocument[];
    verificationStatus: 'success' | 'partial' | 'failed';
  }> {
    try {
      // Get all issued documents
      const documents = await this.getIssuedDocuments(accessToken);

      // Find Aadhaar document
      const aadhaarDoc = documents.find(doc => 
        doc.doctype === 'ADHAR' || doc.doctype === 'AADHAAR'
      );

      // Find PAN document
      const panDoc = documents.find(doc => 
        doc.doctype === 'PANCR' || doc.doctype === 'PAN'
      );

      // Find Driving License
      const dlDoc = documents.find(doc => 
        doc.doctype === 'DRVLC' || doc.doctype === 'DRIVING_LICENSE'
      );

      let aadhaarData = null;
      let panData = null;
      let dlData = null;

      // Download and parse Aadhaar
      if (aadhaarDoc) {
        const aadhaarXml = await this.downloadDocument(accessToken, aadhaarDoc.uri);
        aadhaarData = this.parseAadhaarXml(aadhaarXml.toString());
      }

      // Download PAN
      if (panDoc) {
        const panPdf = await this.downloadDocument(accessToken, panDoc.uri);
        // TODO: Parse PAN PDF to extract number and details
        panData = { available: true, document: panPdf };
      }

      // Download Driving License
      if (dlDoc) {
        const dlPdf = await this.downloadDocument(accessToken, dlDoc.uri);
        dlData = { available: true, document: dlPdf };
      }

      const verificationStatus = aadhaarData && panData ? 'success' : 
                                 aadhaarData || panData ? 'partial' : 'failed';

      return {
        aadhaar: aadhaarData,
        pan: panData,
        drivingLicense: dlData,
        documents,
        verificationStatus,
      };
    } catch (error) {
      console.error('DigiLocker KYC failed:', error);
      throw error;
    }
  }
}

export default new DigiLockerService();
