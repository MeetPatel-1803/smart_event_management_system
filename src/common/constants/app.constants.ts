export const CONSTANTS = {
  ROLES: {
    ADMIN: 'ADMIN',
    ORGANIZER: 'ORGANIZER',
    USER: 'USER',
  },
  META_CODE: {
    SUCCESS: 1,
    FAIL: 0,
  },
  EMAIL: {
    WELCOME: {
      SUB: 'Welcome to Smart Events!',
    },
    RESET_PASSWORD: {
      SUB: 'Reset Your Password',
    },
    REGISTRATION_CONFIRMATION: {
      SUB: 'Registration Confirmed – See You There!',
    },
    EVENT_REMINDER: {
      SUB: 'Reminder: Your Event Is Coming Up!',
    },
    EVENT_CANCELLED: {
      SUB: 'Event Cancelled',
    },
    WAITLIST_PROMOTION: {
      SUB: "Great News – You're Off the Waitlist!",
    },
    SEND_TICKET: {
      SUB: 'Your Event Ticket',
      FILE_NAME: 'ticket.pdf',
    },
  },
  EVENTS: {
    STATUS: {
      DRAFT: 'DRAFT',
      PUBLISHED: 'PUBLISHED',
      CANCELLED: 'CANCELLED',
      COMPLETED: 'COMPLETED',
      DELETED: 'DELETED',
    },
    CATEGORY: {
      CONCERT: 'CONCERT',
      CONFERENCE: 'CONFERENCE',
      BUSINESS: 'BUSINESS',
      WORKSHOP: 'WORKSHOP',
      SPORTS: 'SPORTS',
      FOOD_AND_DRINK: 'FOOD_AND_DRINK',
      ARTS_AND_CULTURE: 'ARTS_AND_CULTURE',
      COMEDY: 'COMEDY',
      FESTIVAL: 'FESTIVAL',
      EXHIBITION: 'EXHIBITION',
      CAREER: 'CAREER',
      EDUCATION: 'EDUCATION',
      HEALTH_AND_WELLNESS: 'HEALTH_AND_WELLNESS',
      TRAVEL_AND_ADVENTURE: 'TRAVEL_AND_ADVENTURE',
      KIDS_AND_FAMILY: 'KIDS_AND_FAMILY',
      COMMUNITY: 'COMMUNITY',
      CHARITY: 'CHARITY',
      WEDDING: 'WEDDING',
      PARTY: 'PARTY',
      RELIGIOUS_AND_SPIRITUAL: 'RELIGIOUS_AND_SPIRITUAL',
    },
  },
  REGISTRATION: {
    STATUS: {
      REGISTERED: 'REGISTERED',
      CANCELLED: 'CANCELLED',
    },
  },
  CLOUDINARY: 'Cloudinary',
  PAGE: 1,
  LIMIT: 10,
  QUEUE: {
    EVENT_WAITING_LIST: 'event-waiting-list',
    EMAIL_QUEUE: 'email-queue',
    QR_CODE_QUEUE: 'qr-code-queue',
  } as const,
  EVENT_JOBS: {
    PROCESS_NEXT_WAITING_USER: 'process-next-waiting-user',
    SEND_CONFIRMATION_EMAIL: 'send-confirmation-email',
    SEND_EVENT_REMINDER: 'send-event-reminder',
    GENERATE_QR_CODE: 'generate-qr-code',
  } as const,
  SORT: {
    ASC: 'ASC',
    DESC: 'DESC',
  } as const,
  SOCKET: {
    NAMESPACE: '/notifications',
    EVENTS: {
      REGISTRATION_SUCCESS: 'registration:success',
      EVENT_FULL: 'event:full',
      WAITLIST_PROMOTED: 'waitlist:promoted',
      EVENT_CANCELLED: 'event:cancelled',
      EVENT_UPDATED: 'event:updated',
      DASHBOARD_UPDATE: 'organizer:dashboard:update',
      JOIN_EVENT_ROOM: 'event:join',
      LEAVE_EVENT_ROOM: 'event:leave',
      EXCEPTION: 'exception',
    } as const,
    ROOMS: {
      user: (userId: string) => `user:${userId}`,
      event: (eventId: string) => `event:${eventId}`,
      organizerDashboard: (organiserId: string) =>
        `organizer-dashboard:${organiserId}`,
    },
  },
  PAYMENT_PROVIDER: Symbol('PAYMENT_PROVIDER'),
  STRIPE_EVENTS: {
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
    PAYMENT_INTENT_FAILED: 'payment_intent.payment_failed',
    PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  },
  STRIPE_CURRENCY: {
    INR: 'inr',
  },
};
