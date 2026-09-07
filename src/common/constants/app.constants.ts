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
      SUB: 'Welcome to Smart event management system',
      TEXT: `Welcome to Smart event management system. Your account has been created successfully.`,
    },
    RESET_PASSWORD: {
      SUB: 'Reset your password',
      TEXT: (url: string) =>
        `Click on the link to reset your password. This link will expire in 1 minutes. ${url}`,
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
};
