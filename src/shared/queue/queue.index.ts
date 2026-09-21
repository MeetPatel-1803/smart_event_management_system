import { CONSTANTS } from 'src/common/constants/app.constants';

export const Queues = Object.values(CONSTANTS.QUEUE).map((name) => ({
  name,
}));
