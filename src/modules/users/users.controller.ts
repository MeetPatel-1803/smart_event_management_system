import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUserGuard } from 'src/common/guards/auth.guard';
import type { AuthenticatedRequest } from 'src/common/guards/auth.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto, ResponseMetaDTO } from 'src/common/dto/response.dto';
import { ListEventDto } from './dto/list-event.dto';
import { ResponseService } from 'src/shared/response/apiResponse.service';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { Messages } from 'src/shared/messages/messages';
import { RegisterEventDto } from './dto/register-event.dto';
import {
  RegisterEventResDto,
  WaitlistedUserResDto,
} from './dto/register-event-response.dto';
import { CancelRegistrationDto } from './dto/cancel-registration.dto';
import { CancelRegistrationResDto } from './dto/cancel-registration-response.dto';
import { RegistrationHistoryDto } from './dto/registration-history.dto';

@Controller('users')
@UseGuards(AuthUserGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
  ) {}

  @Get('/events')
  async listEvents(
    @Query() query: PaginationDto,
  ): Promise<ResponseDto<ListEventDto, ResponseMetaDTO>> {
    const { data, meta } = await this.usersService.listEvents(query);

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.ALL_EVENTS_FETCHED,
      { ...meta },
    );
  }

  @Post('/register/:eventId')
  async registerForEvent(
    @Param('eventId') eventId: string,
    @Body() body: RegisterEventDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponseDto<RegisterEventResDto | WaitlistedUserResDto>> {
    const result = await this.usersService.registerForEvent(
      eventId,
      body,
      req.user,
    );

    if (result instanceof WaitlistedUserResDto) {
      return this.responseService.success(
        { ...result },
        CONSTANTS.META_CODE.SUCCESS,
        Messages.USER_WAITLISTED_SUCCESSFULLY,
      );
    }

    return this.responseService.success(
      { ...result },
      CONSTANTS.META_CODE.SUCCESS,
      Messages.REGISTRATION_INITIATED_SUCCESSFULLY,
    );
  }

  @Post('/cancel/:id')
  async cancelRegistration(
    @Param('id') registrationId: string,
    @Body() body: CancelRegistrationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponseDto<CancelRegistrationResDto>> {
    const result = await this.usersService.cancelRegistration(
      registrationId,
      body,
      req.user,
    );

    return this.responseService.success(
      result,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.REGISTRATION_CANCELLED_SUCCESSFULLY,
    );
  }

  @Get('/history')
  async listRegistrationHistory(
    @Query() query: PaginationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ResponseDto<RegistrationHistoryDto, ResponseMetaDTO>> {
    const { data, meta } = await this.usersService.listRegistrationHistory(
      req.user,
      query,
    );

    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.REGISTRATION_HISTORY_FETCHED,
      { ...meta },
    );
  }
}
