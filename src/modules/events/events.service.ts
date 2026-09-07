import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Repository } from 'typeorm';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';
import {
  EventResponseDto,
  FindAllEventResponseDto,
} from './dto/event-response.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { Helper } from 'src/common/helper/helper.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly imageService: CloudinaryService,
  ) {}

  async create(
    body: CreateEventDto,
    userId: string,
    bannerImage: Express.Multer.File,
  ): Promise<EventResponseDto> {
    const isDuplicateEvent = await this.eventRepository.findOneBy({
      name: body.name,
    });

    if (isDuplicateEvent) {
      throw ApiError.conflict(Messages.EVENT_NAME_TAKEN);
    }

    const event = this.eventRepository.create(body);
    event.organiser_id = userId;

    if (bannerImage) {
      const fileName = Helper.sanitizedFileName(bannerImage.originalname);

      await this.imageService.uploadFile(bannerImage, fileName);
      event.bannerImage = fileName;
    }
    const newEvent = await this.eventRepository.save(event);

    newEvent.bannerImage = newEvent.bannerImage
      ? this.imageService.getImageUrl(newEvent.bannerImage)
      : null;

    return new EventResponseDto({ event: newEvent });
  }

  async findAll(): Promise<FindAllEventResponseDto> {
    const events = await this.eventRepository.find();

    events.forEach((event) => {
      event.bannerImage = event.bannerImage
        ? this.imageService.getImageUrl(event.bannerImage)
        : null;
    });

    return new FindAllEventResponseDto({ events });
  }

  async findOne(id: string): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    event.bannerImage = event.bannerImage
      ? this.imageService.getImageUrl(event.bannerImage)
      : null;

    return new EventResponseDto({ event });
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
  ): Promise<EventResponseDto> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    event.capacity = (updateEventDto.capacity as number)!;
    event.name = (updateEventDto.name as string)!;
    event.description = (updateEventDto.description as string)!;
    event.price = (updateEventDto.price as number)!;
    event.startTime = new Date(updateEventDto.startTime as string)!;
    event.endTime = new Date(updateEventDto.endTime as string)!;
    event.location = (updateEventDto.location as string)!;
    event.category = updateEventDto.category!;
    event.registrationDeadline = new Date(
      updateEventDto.registrationDeadline as string,
    )!;

    if (updateEventDto.bannerImage) {
      const imageFile =
        updateEventDto.bannerImage as unknown as Express.Multer.File;
      const fileName = Helper.sanitizedFileName(imageFile.originalname);
      await this.imageService.uploadFile(imageFile, fileName);
      event.bannerImage = fileName;
    }

    const updatedEvent = await this.eventRepository.save(event);

    updatedEvent.bannerImage = updatedEvent.bannerImage
      ? this.imageService.getImageUrl(updatedEvent.bannerImage)
      : null;

    return new EventResponseDto({ event: updatedEvent });
  }

  async remove(id: string): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    const deletedEvent = await this.eventRepository.delete({ id });

    if (deletedEvent.affected === 0) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }
  }
}
