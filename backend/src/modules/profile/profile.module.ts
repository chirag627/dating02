import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [UsersModule, MediaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
