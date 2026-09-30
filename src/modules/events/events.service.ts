import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventStatus } from './entities/event.entity';
import { In, Repository } from 'typeorm';
import { ApiError } from 'src/shared/response/apiError.service';
import { Messages } from 'src/shared/messages/messages';
import {
  EventResponseDto,
  FindAllEventResponseDto,
} from './dto/event-response.dto';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { Helper } from 'src/common/helper/helper.service';
import { RegistrationStatus, UserEvent } from './entities/user-event.entity';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { CONSTANTS } from 'src/common/constants/app.constants';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    private readonly imageService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async getActiveRegistrantIds(eventId: string): Promise<string[]> {
    const registrations = await this.userEventRepository.find({
      where: {
        eventId,
        status: In([
          RegistrationStatus.REGISTERED,
          RegistrationStatus.PAYMENT_PENDING,
          RegistrationStatus.WAITLISTED,
        ]),
      },
    });

    return registrations.map((registration) => registration.userId);
  }

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
    const {
      capacity,
      name,
      description,
      price,
      startTime,
      endTime,
      location,
      category,
      registrationDeadline,
      bannerImage,
      status,
    } = updateEventDto;
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw ApiError.notFound(Messages.EVENT_NOT_FOUND);
    }

    const wasCancelled = event.status === EventStatus.CANCELLED;
    const isBeingCancelled = !wasCancelled && status === EventStatus.CANCELLED;

    event.capacity = capacity ?? event.capacity;
    event.name = name ?? event.name;
    event.description = description ?? event.description;
    event.price = price ?? event.price;
    event.startTime = startTime ? new Date(startTime) : event.startTime;
    event.endTime = endTime ? new Date(endTime) : event.endTime;
    event.location = location ?? event.location;
    event.category = category ?? event.category;
    event.status = status ?? event.status;
    event.registrationDeadline = registrationDeadline
      ? new Date(registrationDeadline)
      : event.registrationDeadline;

    if (bannerImage) {
      const imageFile = bannerImage as unknown as Express.Multer.File;
      const fileName = Helper.sanitizedFileName(imageFile.originalname);
      await this.imageService.uploadFile(imageFile, fileName);
      event.bannerImage = fileName;
    }

    const updatedEvent = await this.eventRepository.save(event);

    updatedEvent.bannerImage = updatedEvent.bannerImage
      ? this.imageService.getImageUrl(updatedEvent.bannerImage)
      : null;

    const registrantIds = await this.getActiveRegistrantIds(updatedEvent.id);

    if (registrantIds.length) {
      if (isBeingCancelled) {
        this.notificationsService.notifyEventCancelled(registrantIds, {
          eventId: updatedEvent.id,
          eventName: updatedEvent.name,
          message: `"${updatedEvent.name}" has been cancelled by the organiser.`,
        });
      } else {
        this.notificationsService.notifyEventUpdated(registrantIds, {
          eventId: updatedEvent.id,
          eventName: updatedEvent.name,
          changes: updateEventDto as unknown as Record<string, unknown>,
          message: `Details for "${updatedEvent.name}" have been updated.`,
        });
      }
    }

    this.notificationsService.pushOrganizerDashboardUpdate(
      updatedEvent.organiser_id,
      isBeingCancelled
        ? CONSTANTS.SOCKET.EVENTS.EVENT_CANCELLED
        : CONSTANTS.SOCKET.EVENTS.EVENT_UPDATED,
      updatedEvent.id,
      updatedEvent,
    );

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
