/**
 * Aadhaar OTP-based e-KYC Service
 * 
 * This service implements Aadhaar OTP verification using third-party providers
 * (since direct UIDAI integration requires AUA/ASA license)
 * 
 * Providers: IDfy, Signzy, Karza, AuthBridge, etc.
 */

import crypto from 'crypto';

interface AadhaarOTPInitResponse {
  requestId: string;
  message: string;
  status: 'success' | 'failed';
}

interface AadhaarAPIResponse {
  request_id?: string;
  requestId?: string;
  name?: string;
  full_name?: string;
  dob?: string;
  date_of_birth?: string;
  gender?: string;
  address?: {
    house?: string;
    street?: string;
    landmark?: string;
    locality?: string;
    vtc?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  house?: string;
  street?: string;
  landmark?: string;
  locality?: string;
  vtc?: string;
  dist?: string;
  state?: string;
  pincode?: string;
  photo_base64?: string;
  photo?: string;
  masked_aadhaar?: string;
  aadhaar_number?: string;
  email?: string;
  mobile?: string;
  care_of?: string;
  co?: string;
  xml_data?: string;
}

interface AadhaarOTPVerifyResponse {
  status: 'success' | 'failed';
  data: {
    name: string;
    dob: string;
    gender: 'M' | 'F' | 'O';
    address: {
      house: string;
      street: string;
      landmark: string;
      locality: string;
      vtc: string;
      dist: string;
      state: string;
      pincode: string;
      country: string;
    };
    photo: string; // Base64 encoded
    maskedAadhaar: string; // XXXX-XXXX-1234
    email?: string;
    mobile?: string;
    careOf?: string;
  };
  xmlData?: string; // Encrypted XML from UIDAI
}

interface FaceMatchResult {
  match: boolean;
  confidence: number;
  similarity: number;
}

class AadhaarOTPService {
  private apiKey: string;
  private apiEndpoint: string;
  private provider: string;

  constructor() {
    // Using third-party provider (e.g., IDfy, Signzy)
    this.provider = process.env.AADHAAR_PROVIDER || 'idfy'; // or 'signzy', 'karza'
    this.apiKey = process.env.AADHAAR_API_KEY || '';
    this.apiEndpoint = process.env.AADHAAR_API_ENDPOINT || 'https://api.idfy.com/v3/';
  }

  /**
   * Validate Aadhaar number format
   * 12 digits, Verhoeff algorithm checksum
   */
  validateAadhaarFormat(aadhaarNumber: string): boolean {
    // Remove spaces and hyphens
    const cleaned = aadhaarNumber.replace(/[\s-]/g, '');

    // Must be 12 digits
    if (!/^\d{12}$/.test(cleaned)) {
      return false;
    }

    // Verhoeff algorithm validation
    return this.verifyVerhoeffChecksum(cleaned);
  }

  /**
   * Verhoeff checksum algorithm for Aadhaar validation
   */
  private verifyVerhoeffChecksum(num: string): boolean {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];

    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];

    let c = 0;
    const digits = num.split('').map(Number).reverse();

    for (let i = 0; i < digits.length; i++) {
      c = d[c][p[i % 8][digits[i]]];
    }

    return c === 0;
  }

  /**
   * Step 1: Initiate OTP to Aadhaar-registered mobile
   */
  async initiateOTP(aadhaarNumber: string): Promise<AadhaarOTPInitResponse> {
    // Validate format first
    if (!this.validateAadhaarFormat(aadhaarNumber)) {
      throw new Error('Invalid Aadhaar number format');
    }

    try {
      // Call third-party provider API
      const response = await fetch(`${this.apiEndpoint}/aadhaar/otp/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar_number: aadhaarNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP to Aadhaar mobile');
      }

      const data: AadhaarAPIResponse = await response.json();

      return {
        requestId: data.request_id || data.requestId || '',
        message: 'OTP sent to Aadhaar-registered mobile number',
        status: 'success',
      };
    } catch (error) {
      console.error('Aadhaar OTP initiation failed:', error);
      
      // Mock response for development
      if (process.env.NODE_ENV === 'development') {
        return {
          requestId: `req_${crypto.randomBytes(16).toString('hex')}`,
          message: 'OTP sent (mock)',
          status: 'success',
        };
      }

      throw error;
    }
  }

  /**
   * Step 2: Verify OTP and fetch KYC data
   */
  async verifyOTP(
    requestId: string,
    otp: string
  ): Promise<AadhaarOTPVerifyResponse> {
    try {
      const response = await fetch(`${this.apiEndpoint}/aadhaar/otp/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          otp,
        }),
      });

      if (!response.ok) {
        throw new Error('OTP verification failed');
      }

      const data: AadhaarAPIResponse = await response.json();

      // Decrypt and parse response
      const kycData: AadhaarOTPVerifyResponse = {
        status: 'success',
        data: {
          name: data.name || data.full_name || '',
          dob: data.dob || data.date_of_birth || '',
          gender: (data.gender || 'O') as 'M' | 'F' | 'O',
          address: {
            house: data.address?.house || data.house || '',
            street: data.address?.street || data.street || '',
            landmark: data.address?.landmark || data.landmark || '',
            locality: data.address?.locality || data.locality || '',
            vtc: data.address?.vtc || data.vtc || '',
            dist: data.address?.district || data.dist || '',
            state: data.address?.state || data.state || '',
            pincode: data.address?.pincode || data.pincode || '',
            country: 'India',
          },
          photo: data.photo_base64 || data.photo || '',
          maskedAadhaar: data.masked_aadhaar || this.maskAadhaar(data.aadhaar_number || ''),
          email: data.email,
          mobile: data.mobile,
          careOf: data.care_of || data.co,
        },
        xmlData: data.xml_data,
      };

      return kycData;
    } catch (error) {
      console.error('Aadhaar OTP verification failed:', error);

      // Mock response for development
      if (process.env.NODE_ENV === 'development') {
        return {
          status: 'success',
          data: {
            name: 'Test User',
            dob: '01-01-1990',
            gender: 'M',
            address: {
              house: '123',
              street: 'Test Street',
              landmark: 'Near Test Park',
              locality: 'Test Locality',
              vtc: 'Test VTC',
              dist: 'Test District',
              state: 'Test State',
              pincode: '110001',
              country: 'India',
            },
            photo: '', // Base64 encoded photo would be here
            maskedAadhaar: 'XXXX-XXXX-1234',
          },
        };
      }

      throw error;
    }
  }

  /**
   * Mask Aadhaar number (UIDAI compliance)
   */
  maskAadhaar(aadhaarNumber: string): string {
    const cleaned = aadhaarNumber.replace(/[\s-]/g, '');
    return `XXXX-XXXX-${cleaned.slice(-4)}`;
  }

  /**
   * Face matching using AI
   * Compare Aadhaar photo with live selfie
   */
  async matchFaces(
    aadhaarPhoto: string, // Base64 from Aadhaar
    selfiePhoto: string   // Base64 from camera
  ): Promise<FaceMatchResult> {
    // TODO: Integrate with face matching API
    // Options:
    // 1. AWS Rekognition
    // 2. Azure Face API
    // 3. Face++ API
    // 4. DeepFace (open source)

    try {
      // Example: AWS Rekognition
      // const rekognition = new AWS.Rekognition();
      // const result = await rekognition.compareFaces({
      //   SourceImage: { Bytes: Buffer.from(aadhaarPhoto, 'base64') },
      //   TargetImage: { Bytes: Buffer.from(selfiePhoto, 'base64') },
      //   SimilarityThreshold: 90
      // }).promise();

      // Mock response for development
      if (process.env.NODE_ENV === 'development') {
        return {
          match: true,
          confidence: 95.5,
          similarity: 96.2,
        };
      }

      // In production, call actual face matching API
      return {
        match: false,
        confidence: 0,
        similarity: 0,
      };
    } catch (error) {
      console.error('Face matching failed:', error);
      throw error;
    }
  }

  /**
   * Liveness detection to prevent photo/video spoofing
   */
  async detectLiveness(selfieVideo: Buffer): Promise<{
    isLive: boolean;
    confidence: number;
    checks: {
      blink: boolean;
      headMovement: boolean;
      lipMovement?: boolean;
    };
  }> {
    // TODO: Integrate with liveness detection API
    // Options:
    // 1. AWS Rekognition Video
    // 2. FaceTec
    // 3. iProov
    // 4. Onfido

    // Mock response for development
    if (process.env.NODE_ENV === 'development') {
      return {
        isLive: true,
        confidence: 98.5,
        checks: {
          blink: true,
          headMovement: true,
          lipMovement: true,
        },
      };
    }

    return {
      isLive: false,
      confidence: 0,
      checks: {
        blink: false,
        headMovement: false,
      },
    };
  }

  /**
   * Complete Aadhaar-based eKYC verification flow
   */
  async performCompleteKYC(
    aadhaarNumber: string,
    otp: string,
    requestId: string,
    selfiePhoto?: string
  ): Promise<{
    verified: boolean;
    kycData: AadhaarOTPVerifyResponse['data'];
    faceMatch?: FaceMatchResult;
    riskScore: number;
  }> {
    // Step 1: Verify OTP and get KYC data
    const kycResult = await this.verifyOTP(requestId, otp);

    if (kycResult.status !== 'success') {
      throw new Error('KYC verification failed');
    }

    let faceMatchResult;
    let riskScore = 100; // Start with full score

    // Step 2: Optional face matching if selfie provided
    if (selfiePhoto && kycResult.data.photo) {
      try {
        faceMatchResult = await this.matchFaces(kycResult.data.photo, selfiePhoto);
        
        if (!faceMatchResult.match) {
          riskScore -= 50; // High risk if face doesn't match
        } else if (faceMatchResult.confidence < 90) {
          riskScore -= 20; // Medium risk if low confidence
        }
      } catch (error) {
        console.error('Face matching error:', error);
        riskScore -= 10; // Small penalty for technical error
      }
    }

    return {
      verified: kycResult.status === 'success',
      kycData: kycResult.data,
      faceMatch: faceMatchResult,
      riskScore,
    };
  }

  /**
   * Generate VID (Virtual ID) - recommended over Aadhaar number
   */
  async generateVID(aadhaarNumber: string): Promise<{ vid: string }> {
    // TODO: Integrate with UIDAI VID API (requires AUA license)
    // Or use third-party provider

    return {
      vid: `${Math.random().toString().slice(2, 18)}`, // 16-digit VID
    };
  }
}

export default new AadhaarOTPService();
