export interface baseContext {
  supportEmail: string;
  year: number;
}

export interface WelcomeEmailContext extends baseContext {
  userName: string;
}

export interface ResetPasswordEmailContext extends baseContext {
  resetPasswordUrl: string;
}

export interface RegistrationConfirmationEmailContext extends baseContext {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  eventUrl: string;
  registrationId: string;
  meetingUrl?: string;
}

export interface EventReminderEmailContext extends baseContext {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  eventUrl: string;
  registrationId: string;
  timeUntilEvent: string;
  meetingUrl?: string;
}

export interface EventCancelledEmailContext extends baseContext {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  registrationId: string;
  cancellationReason?: string;
}

export interface WaitlistPromotionEmailContext extends baseContext {
  userName: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  eventType: string;
  registrationUrl: string;
  registrationDeadline?: string;
  meetingUrl?: string;
}

export interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendMailOptions<T extends Record<string, unknown>> {
  to: string;
  subject: string;
  template: string;
  context: T;
  attachments?: MailAttachment[];
}
