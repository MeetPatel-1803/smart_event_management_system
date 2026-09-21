import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CONSTANTS } from 'src/common/constants/app.constants';

@Injectable()
export class SeedersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async userSeeder(): Promise<void> {
    await this.userRepository.query(
      `
    DELETE FROM users
    WHERE email NOT IN ($1, $2)
  `,
      ['patelmohit8379@gmail.com', 'jaythakkar@gmail.com'],
    );

    const password = await bcrypt.hash(process.env.USER_PASSWORD as string, 10);

    const admin = {
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      role: CONSTANTS.ROLES.ADMIN,
    };

    const organizers = Array.from({ length: 4 }, (_, index) => ({
      name: `Organizer ${index + 1}`,
      email: `organizer${index + 1}@yopmail.com`,
      role: CONSTANTS.ROLES.ORGANIZER,
    }));

    const users = Array.from({ length: 15 }, (_, index) => ({
      name: `User ${index + 1}`,
      email: `user${index + 1}@yopmail.com`,
      role: CONSTANTS.ROLES.USER,
    }));

    const seedUsers = [admin, ...organizers, ...users];

    const userEntities = seedUsers.map((user) =>
      this.userRepository.create({
        ...user,
        password,
        resetToken: null,
        resetTokenExpire: null,
        refreshToken: null,
      }),
    );

    await this.userRepository.save(userEntities);
  }
}
