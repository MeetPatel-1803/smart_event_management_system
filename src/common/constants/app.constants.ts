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
};
