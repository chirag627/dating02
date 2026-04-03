import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto, RespondBookingDto } from './dto/booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a booking request' })
  create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingService.create(user._id.toString(), dto);
  }

  @Patch('respond')
  @ApiOperation({ summary: 'Accept or reject a booking' })
  respond(@CurrentUser() user: any, @Body() dto: RespondBookingDto) {
    return this.bookingService.respond(user._id.toString(), dto);
  }

  @Post('complete/:id')
  @ApiOperation({ summary: 'Mark booking as complete' })
  complete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.bookingService.complete(user._id.toString(), id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get booking history' })
  history(@CurrentUser() user: any) {
    return this.bookingService.getHistory(user._id.toString(), user.role);
  }
}
