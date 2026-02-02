import { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';
import { generateId } from '../utils/id-generator';

/**
 * In-House KYC Service
 * 
 * NO THIRD PARTY DEPENDENCY!
 * 
 * Features:
 * - Document upload (manual verification)
 * - Admin review dashboard
 * - Approve/Reject workflow
 * - Optional: OCR for text extraction (using free tesseract.js)
 * - Optional: Face matching (using free face-api.js)
 * 
 * Cost: FREE (only storage costs)
 */

export interface KYCDocument {
  id: string;
  sessionId: string;
  type: 'passport' | 'national_id' | 'driving_license' | 'bank_statement' | 'selfie';
  filename: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface KYCSession {
  id: string;
  tenantId: string;
  initiatedBy: string;
  endUserName: string;
  endUserEmail: string;
  endUserPhone?: string;
  status: 'pending_upload' | 'pending_review' | 'approved' | 'rejected' | 'expired';
  documents: KYCDocument[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

class InHouseKYCService {
  private uploadsDir: string;
  private sessions: Map<string, KYCSession>;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');
    this.sessions = new Map();
    
    // Create uploads directory if not exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Create new KYC session
   */
  async createSession(data: {
    tenantId: string;
    initiatedBy: string;
    endUserName: string;
    endUserEmail: string;
    endUserPhone?: string;
  }): Promise<KYCSession> {
    const sessionId = generateId('kyc_session');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session: KYCSession = {
      id: sessionId,
      tenantId: data.tenantId,
      initiatedBy: data.initiatedBy,
      endUserName: data.endUserName,
      endUserEmail: data.endUserEmail,
      endUserPhone: data.endUserPhone,
      status: 'pending_upload',
      documents: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    this.sessions.set(sessionId, session);
    // TODO: Save to database

    return session;
  }

  /**
   * Generate upload URL for end user
   */
  getUploadURL(sessionId: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const fullUrl = `${frontendUrl}/verify/kyc/${sessionId}`;
    console.log('🔗 Generated verification URL:', fullUrl);
    console.log('📌 FRONTEND_URL from env:', process.env.FRONTEND_URL);
    return fullUrl;
  }

  /**
   * Upload document
   */
  async uploadDocument(
    sessionId: string,
    file: {
      filename: string;
      data: Buffer;
      mimetype: string;
    },
    documentType: string
  ): Promise<KYCDocument> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (session.status === 'expired') {
      throw new Error('Session expired');
    }

    // Create session directory
    const sessionDir = path.join(this.uploadsDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // Generate unique filename
    const documentId = generateId('doc');
    const ext = path.extname(file.filename);
    const filename = `${documentType}_${documentId}${ext}`;
    const filePath = path.join(sessionDir, filename);

    // Save file
    fs.writeFileSync(filePath, file.data);

    // Create document record
    const document: KYCDocument = {
      id: documentId,
      sessionId,
      type: documentType as any,
      filename,
      filePath,
      fileSize: file.data.length,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
    };

    // Add to session
    session.documents.push(document);
    session.status = 'pending_review';
    session.updatedAt = new Date().toISOString();

    // TODO: Update database
    // TODO: Notify admin via email/notification

    return document;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): KYCSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions for tenant
   */
  getSessionsByTenant(tenantId: string): KYCSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.tenantId === tenantId
    );
  }

  /**
   * Get sessions pending review
   */
  getPendingReviews(tenantId: string): KYCSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) =>
        session.tenantId === tenantId && session.status === 'pending_review'
    );
  }

  /**
   * Approve KYC session
   */
  async approveSession(
    sessionId: string,
    reviewedBy: string,
    notes?: string
  ): Promise<KYCSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'approved';
    session.reviewedBy = reviewedBy;
    session.reviewedAt = new Date().toISOString();
    session.reviewNotes = notes;
    session.updatedAt = new Date().toISOString();

    // TODO: Update database
    // TODO: Send notification to end user
    // TODO: Create audit log

    return session;
  }

  /**
   * Reject KYC session
   */
  async rejectSession(
    sessionId: string,
    reviewedBy: string,
    reason: string
  ): Promise<KYCSession> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'rejected';
    session.reviewedBy = reviewedBy;
    session.reviewedAt = new Date().toISOString();
    session.reviewNotes = reason;
    session.updatedAt = new Date().toISOString();

    // TODO: Update database
    // TODO: Send notification to end user
    // TODO: Create audit log

    return session;
  }

  /**
   * Get document file path for viewing
   */
  getDocumentPath(sessionId: string, documentId: string): string | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return undefined;
    }

    const document = session.documents.find((doc) => doc.id === documentId);
    return document?.filePath;
  }

  /**
   * Delete session and documents
   */
  async deleteSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Delete files
    const sessionDir = path.join(this.uploadsDir, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true });
    }

    // Remove from memory
    this.sessions.delete(sessionId);

    // TODO: Delete from database
  }

  /**
   * Optional: Extract text from document using OCR
   * Uses tesseract.js (FREE, no API key needed)
   */
  async extractTextFromDocument(filePath: string): Promise<string> {
    // TODO: Implement OCR using tesseract.js
    // const Tesseract = require('tesseract.js');
    // const result = await Tesseract.recognize(filePath, 'eng');
    // return result.data.text;
    return 'OCR not implemented yet';
  }

  /**
   * Optional: Validate document quality
   */
  async validateDocumentQuality(filePath: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    // TODO: Check image quality, blur, brightness, etc.
    // Can use sharp library (free) for image processing
    return {
      isValid: true,
      issues: [],
    };
  }
}

export const inHouseKYC = new InHouseKYCService();
