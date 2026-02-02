import nodemailer from 'nodemailer';

/**
 * Email Service for sending KYC links
 * 
 * Uses nodemailer to send emails via SMTP
 * Can be configured with Gmail, SendGrid, AWS SES, etc.
 */

class EmailService {
  private transporter: any;

  constructor() {
    // Configure email transporter
    // For testing, we'll use a temporary solution
    // In production, use your own SMTP or email service
    console.log('📧 Initializing email service...');
    console.log('SMTP Host:', process.env.SMTP_HOST || 'mail.autoxweb.com');
    console.log('SMTP Port:', process.env.SMTP_PORT || '465');
    console.log('SMTP User:', process.env.SMTP_USER || 'info@autoxweb.com');
    console.log('SMTP Password set:', !!process.env.SMTP_PASSWORD);
    console.log('SMTP Password length:', process.env.SMTP_PASSWORD?.length);
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.autoxweb.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || 'info@autoxweb.com',
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allow self-signed certs
      },
    });
  }

  /**
   * Send KYC verification link via email
   */
  async sendKYCLink(params: {
    customerName: string;
    customerEmail: string;
    verificationUrl: string;
    sessionId: string;
    documentTypes: string[];
    companyName?: string;
    verificationMethods?: any;
    verificationUrls?: any;
  }) {
    const { 
      customerName, 
      customerEmail, 
      verificationUrl, 
      sessionId, 
      documentTypes, 
      companyName,
      verificationMethods = { documentUpload: true },
      verificationUrls = {}
    } = params;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Complete Your KYC Verification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .info-box { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛡️ KYC Verification Required</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            
            <p>You have been requested to complete your identity verification (KYC) process${companyName ? ` by <strong>${companyName}</strong>` : ''}.</p>
            
            <div class="info-box">
              <strong>📋 Required Documents:</strong>
              <ul>
                ${documentTypes.map(doc => `<li>${doc}</li>`).join('')}
              </ul>
            </div>
            
            <p><strong>What you need to do:</strong></p>
            <ol>
              ${verificationMethods.livenessCheck ? '<li>Complete live face verification</li>' : ''}
              ${verificationMethods.digilocker ? '<li>Verify with DigiLocker (government documents)</li>' : ''}
              ${verificationMethods.documentUpload ? '<li>Upload required documents</li>' : ''}
              <li>Submit for review</li>
            </ol>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">
                ✅ Start Verification
              </a>
            </div>
            
            <p style="font-size: 12px; color: #666;">
              <strong>Verification Link:</strong><br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            
            <div class="info-box">
              <strong>⏱️ Important:</strong><br>
              • This link will expire in 7 days<br>
              • Session ID: <code>${sessionId}</code><br>
              • Estimated time: 5-10 minutes
            </div>
            
            <p><strong>Need help?</strong><br>
            If you have any questions or face any issues, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>${companyName || 'Callvia Certo'} Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© 2026 Callvia Certo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('📤 Attempting to send email to:', customerEmail);
      console.log('From:', `"Autoxweb" <info@autoxweb.com>`);
      console.log('Subject:', `🛡️ Complete Your Identity Verification - ${companyName || 'Autoxweb'}`);
      
      const info = await this.transporter.sendMail({
        from: `"Autoxweb" <info@autoxweb.com>`,
        to: customerEmail,
        subject: `🛡️ Complete Your Identity Verification - ${companyName || 'Autoxweb'}`,
        html: emailHtml,
      });

      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
      console.log('Response:', info.response);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Email sending FAILED!');
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error command:', error.command);
      console.error('Error response:', error.response);
      console.error('Error responseCode:', error.responseCode);
      console.error('Full error:', error);
      
      // Don't throw - let the API continue
      console.error('⚠️ Email failed but continuing...');
    }
  }

  /**
   * Send KYC result notification
   */
  async sendKYCResult(params: {
    customerName: string;
    customerEmail: string;
    status: 'approved' | 'rejected';
    reason?: string;
    companyName?: string;
  }) {
    const { customerName, customerEmail, status, reason, companyName } = params;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${status === 'approved' ? '#10b981' : '#ef4444'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${status === 'approved' ? '✅ Verification Approved!' : '❌ Verification Rejected'}</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${customerName}</strong>,</p>
            
            ${status === 'approved' 
              ? '<p>Your identity verification has been <strong>successfully approved</strong>! ✅</p><p>You can now access all services.</p>'
              : `<p>Unfortunately, your identity verification was <strong>rejected</strong>.</p><p><strong>Reason:</strong> ${reason || 'Documents did not meet requirements.'}</p><p>Please submit a new verification with correct documents.</p>`
            }
            
            <p>Best regards,<br>
            <strong>${companyName || 'Callvia Certo'} Team</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Autoxweb" <info@autoxweb.com>`,
        to: customerEmail,
        subject: `${status === 'approved' ? '✅' : '❌'} KYC Verification ${status === 'approved' ? 'Approved' : 'Rejected'}`,
        html: emailHtml,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Email sending failed:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send welcome email with temporary credentials
   */
  async sendWelcomeEmail(params: {
    name: string;
    email: string;
    companyName: string;
    temporaryPassword: string;
    loginUrl?: string;
  }) {
    const { name, email, companyName, temporaryPassword, loginUrl = 'http://localhost:5173/login' } = params;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Callvia Certo!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Your account has been successfully created for <strong>${companyName}</strong>!</p>
            
            <div class="credentials-box">
              <h3>🔐 Your Login Credentials</h3>
              <p><strong>Email:</strong> <code>${email}</code></p>
              <p><strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Notice:</strong><br>
              This is a temporary password. For your security, please change it immediately after your first login.
            </div>
            
            <div style="text-align: center;">
              <a href="${loginUrl}" class="button">🚀 Login to Your Account</a>
            </div>
            
            <h3>📋 Next Steps:</h3>
            <ol>
              <li>Click the login button above</li>
              <li>Enter your email and temporary password</li>
              <li>Change your password in your profile settings</li>
              <li>Complete your company profile setup</li>
              <li>Start using KYC verification services</li>
            </ol>
            
            <p><strong>Need help?</strong><br>
            If you have any questions or need assistance, please contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>Callvia Certo Team</strong></p>
          </div>
          <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>© 2026 Callvia Certo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      console.log('📤 Sending welcome email to:', email);
      
      const info = await this.transporter.sendMail({
        from: `"Callvia Certo" <info@autoxweb.com>`,
        to: email,
        subject: `🎉 Welcome to Callvia Certo - Your Account Credentials`,
        html: emailHtml,
      });

      console.log('✅ Welcome email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error: any) {
      console.error('❌ Failed to send welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
