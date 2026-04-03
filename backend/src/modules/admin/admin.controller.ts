import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/utils/roles.decorator';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class BanDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  reason: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  getUsers(@Query('role') role?: string, @Query('page') page = 1) {
    return this.adminService.getAllUsers(+page, 20, role);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUser(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Patch('ban')
  @ApiOperation({ summary: 'Ban a user' })
  banUser(@Body() dto: BanDto) {
    return this.adminService.banUser(dto.userId, dto.reason);
  }

  @Patch('unban/:id')
  @ApiOperation({ summary: 'Unban a user' })
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  getBookings() {
    return this.adminService.getBookings();
  }

  @Patch('companion/approve/:userId')
  @ApiOperation({ summary: 'Approve companion' })
  approveCompanion(@Param('userId') userId: string) {
    return this.adminService.approveCompanion(userId);
  }

  @Patch('companion/reject/:userId')
  @ApiOperation({ summary: 'Reject companion' })
  rejectCompanion(@Param('userId') userId: string) {
    return this.adminService.rejectCompanion(userId);
  }
}
