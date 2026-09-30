import { Injectable, Logger } from '@nestjs/common';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { NotificationsGateway } from './notifications.gateway';
import {
  EventCancelledPayload,
  EventFullPayload,
  EventUpdatedPayload,
  OrganizerDashboardUpdatePayload,
  RegistrationSuccessPayload,
  WaitlistPromotedPayload,
} from './interfaces/notification.interface';

const { EVENTS, ROOMS } = CONSTANTS.SOCKET;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly gateway: NotificationsGateway) {}

  notifyRegistrationSuccess(
    userId: string,
    payload: RegistrationSuccessPayload,
  ): void {
    this.emitToRoom(ROOMS.user(userId), EVENTS.REGISTRATION_SUCCESS, payload);
  }

  notifyWaitlistPromoted(
    userId: string,
    payload: WaitlistPromotedPayload,
  ): void {
    this.emitToRoom(ROOMS.user(userId), EVENTS.WAITLIST_PROMOTED, payload);
  }

  // Notifies anyone watching the event page as well as the organizer's dashboard.
  notifyEventFull(organiserId: string, payload: EventFullPayload): void {
    this.emitToRoom(ROOMS.event(payload.eventId), EVENTS.EVENT_FULL, payload);
    this.pushOrganizerDashboardUpdate(
      organiserId,
      EVENTS.EVENT_FULL,
      payload.eventId,
      payload,
    );
  }

  notifyEventCancelled(
    userIds: string[],
    payload: EventCancelledPayload,
  ): void {
    this.emitToRoom(
      ROOMS.event(payload.eventId),
      EVENTS.EVENT_CANCELLED,
      payload,
    );
    userIds.forEach((userId) =>
      this.emitToRoom(ROOMS.user(userId), EVENTS.EVENT_CANCELLED, payload),
    );
  }

  notifyEventUpdated(userIds: string[], payload: EventUpdatedPayload): void {
    this.emitToRoom(
      ROOMS.event(payload.eventId),
      EVENTS.EVENT_UPDATED,
      payload,
    );
    userIds.forEach((userId) =>
      this.emitToRoom(ROOMS.user(userId), EVENTS.EVENT_UPDATED, payload),
    );
  }

  // Single generic channel an organizer dashboard (current or future) can
  // subscribe to for any event-related change, keyed by `type`.
  pushOrganizerDashboardUpdate<T>(
    organiserId: string,
    type: string,
    eventId: string,
    data: T,
  ): void {
    const payload: OrganizerDashboardUpdatePayload<T> = {
      type,
      eventId,
      data,
      timestamp: new Date().toISOString(),
    };

    this.emitToRoom(
      ROOMS.organizerDashboard(organiserId),
      EVENTS.DASHBOARD_UPDATE,
      payload,
    );
  }

  private emitToRoom(room: string, event: string, payload: unknown): void {
    try {
      this.gateway.server.to(room).emit(event, payload);
    } catch (error) {
      this.logger.error(
        `Failed to emit "${event}" to room "${room}"`,
        error as Error,
      );
    }
  }
}
