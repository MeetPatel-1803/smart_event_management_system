import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDto,
  CreatePaymentResDto,
} from './dto/create-payment.dto';
import { AuthUserGuard } from 'src/common/guards/auth.guard';
import { ResponseDto } from 'src/common/dto/response.dto';
import { ResponseService } from '../response/apiResponse.service';
import { CONSTANTS } from 'src/common/constants/app.constants';
import { Messages } from '../messages/messages';

@Controller('payment')
@UseGuards(AuthUserGuard)
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly responseService: ResponseService,
  ) {}

  @Post('/create')
  async createPayment(
    @Body() body: CreatePaymentDto,
  ): Promise<ResponseDto<CreatePaymentResDto>> {
    const data = await this.paymentService.createPayment(body);
    return this.responseService.success(
      data,
      CONSTANTS.META_CODE.SUCCESS,
      Messages.PAYMENT_CREATED,
    );
  }

  // ------------ These URLs will be frontend-url but fornow will keep it here to just show the success response.
  @Get('/success')
  paymentSuccess() {
    return this.responseService.successWithoutData(
      CONSTANTS.META_CODE.SUCCESS,
      Messages.PAYMENT_SUCCESS,
    );
  }

  @Get('/cancel')
  paymentCancel() {
    return this.responseService.successWithoutData(
      CONSTANTS.META_CODE.SUCCESS,
      Messages.PAYMENT_CANCELLED,
    );
  }
  // ------------------------------------------------
}
