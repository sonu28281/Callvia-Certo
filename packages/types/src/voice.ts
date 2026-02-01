// Voice Provider Interface
export interface IVoiceProvider {
  name: string;
  initiateCall(data: VoiceCallDTO): Promise<CallSession>;
  endCall(callId: string): Promise<void>;
  getRecording(callId: string): Promise<string>;
}

// Call Session
export interface CallSession {
  call_id: string;
  provider: string;
  status: CallStatus;
  started_at: Date;
  ended_at?: Date;
  duration_seconds?: number;
}

// Call Status
export enum CallStatus {
  INITIATED = 'INITIATED',
  RINGING = 'RINGING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  NO_ANSWER = 'NO_ANSWER',
}

// Voice Call DTO
export interface VoiceCallDTO {
  to_phone: string;
  from_phone: string;
  script?: string;
  record: boolean;
  max_duration_seconds?: number;
  callback_url?: string;
}

// Voice Verification Result
export interface VoiceVerificationResult {
  call_id: string;
  verified: boolean;
  confidence_score: number;
  recording_url?: string;
  transcript?: string;
  verified_at: Date;
}
