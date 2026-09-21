import { INestApplication } from '@nestjs/common';
import { SeedersService } from './seeders.service';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';

// type SeederMethod = (this: SeedersService) => Promise<void>;

export class SeederRunner {
  constructor(private readonly app: INestApplication) {}

  private getAvailableSeeders(): string[] {
    return Object.getOwnPropertyNames(SeedersService.prototype)
      .filter((method) => method.endsWith('Seeder'))
      .map((method) => method.replace(/Seeder$/, ''));
  }

  async run(): Promise<void> {
    const seederName = process.argv[3];
    const seedersService = this.app.get(SeedersService);

    const availableSeeders = this.getAvailableSeeders();

    if (!seederName || !availableSeeders.includes(seederName)) {
      throw ApiError.notFound(Messages.SEEDER_NOT_FOUND);
    }

    const methodName = `${seederName}Seeder` as keyof SeedersService;

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const seederMethod = seedersService[methodName];

    if (typeof seederMethod !== 'function') {
      throw new Error(`Seeder method "${methodName}" not found.`);
    }

    console.log(`🌱 Running ${seederName} seeder...`);

    await seederMethod.call(seedersService);

    console.log(`✅ ${seederName} seeder completed.`);
  }
}
