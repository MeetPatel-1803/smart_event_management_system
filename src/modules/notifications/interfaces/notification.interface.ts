import { Socket } from 'socket.io';

export interface RegistrationSuccessPayload {
  registrationId: string;
  eventId: string;
  eventName: string;
  noOfSeats: number;
  message: string;
}

export interface EventFullPayload {
  eventId: string;
  eventName: string;
  capacity: number;
  message: string;
}

export interface WaitlistPromotedPayload {
  registrationId: string;
  eventId: string;
  eventName: string;
  noOfSeats: number;
  message: string;
}

export interface EventCancelledPayload {
  eventId: string;
  eventName: string;
  message: string;
}

export interface EventUpdatedPayload {
  eventId: string;
  eventName: string;
  changes: Record<string, unknown>;
  message: string;
}

// Generic envelope so organizer dashboards (current + future) can subscribe to
// one channel and branch on `type` instead of wiring a new listener per event.
export interface OrganizerDashboardUpdatePayload<T = unknown> {
  type: string;
  eventId: string;
  data: T;
  timestamp: string;
}

export interface SocketUser {
  id: string;
  role: string;
}

export interface AuthenticatedSocket extends Socket {
  data: {
    user: SocketUser;
  };
}
