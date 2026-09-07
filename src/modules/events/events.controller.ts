import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import type { AuthenticatedRequest } from 'src/common/guards/auth.guard';
import { AuthUserGuard } from 'src/common/guards/auth.guard';
import { UserRoleGuard } from 'src/common/guards/user-role.guard';
import { Roles } from 'src/common/decorators/user-role.decorator';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { ResponseDto } from 'src/common/dto/response.dto';
import {
  EventResponseDto,
  FindAllEventResponseDto,
} from './dto/event-response.dto';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { Messages } from 'src/shared/messages/messages';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('events')
@UseGuards(AuthUserGuard, UserRoleGuard)
@Roles(CONSTANTS.ROLES.ORGANIZER)
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('/create')
  @UseInterceptors(FileInterceptor('bannerImage'))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @Req() req: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipeBuilder() // Imp: In-built file upload validators (we can make custom file validators too)
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|gif|webp)$/ })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build(),
    )
    bannerImage?: Express.Multer.File,
  ): Promise<ResponseDto<EventResponseDto>> {
    const data = await this.eventsService.create(
      createEventDto,
      req.user.id,
      bannerImage as Express.Multer.File,
    );

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.EVENT_CREATED,
    );
  }

  @Get('/all')
  async findAll(): Promise<ResponseDto<FindAllEventResponseDto>> {
    const data = await this.eventsService.findAll();

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.ALL_EVENTS_FETCHED,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<ResponseDto<EventResponseDto>> {
    const data = await this.eventsService.findOne(id);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.EVENT_FETCHED,
    );
  }

  // We can update the status of the events such as (CANCELLED, PUBLISHED).
  @Patch(':id')
  @UseInterceptors(FileInterceptor('bannerImage'))
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpeg|jpg|png|gif|webp)$/ })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build({
          fileIsRequired: false,
        }),
    )
    bannerImage?: Express.Multer.File,
  ): Promise<ResponseDto<EventResponseDto>> {
    if (bannerImage) {
      updateEventDto.bannerImage = bannerImage as unknown as string;
    }
    const data = await this.eventsService.update(id, updateEventDto);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.EVENT_UPDATED,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseDto<null>> {
    await this.eventsService.remove(id);

    return this.responseService.successWithoutData(
      CONSTANTS.META_CODE.SUCCESS,
      Messages.EVENT_DELETED,
    );
  }
}
