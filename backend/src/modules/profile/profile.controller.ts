import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/utils/current-user.decorator';
import { MediaService } from '../media/media.service';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly mediaService: MediaService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  getMyProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user._id.toString());
  }

  @Put('update')
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user._id.toString(), dto);
  }

  @Post('upload-photo')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPhoto(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    const result = await this.mediaService.uploadImage(file);
    return this.profileService.addPhoto(user._id.toString(), result.url);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get my matches' })
  getMatches(@CurrentUser() user: any) {
    return this.profileService.getMatches(user._id.toString());
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover profiles' })
  discover(@CurrentUser() user: any) {
    return this.profileService.discover(user._id.toString());
  }

  @Get('compatibility/:id')
  @ApiOperation({ summary: 'Get compatibility score with another user' })
  getCompatibility(@CurrentUser() user: any, @Param('id') targetId: string) {
    return this.profileService.getCompatibilityScore(user._id.toString(), targetId);
  }
}
