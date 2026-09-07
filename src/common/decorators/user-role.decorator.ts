import { SetMetadata } from '@nestjs/common';
import { CONSTANTS } from '../constants/app.constants';

export type Role = (typeof CONSTANTS.ROLES)[keyof typeof CONSTANTS.ROLES];
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
