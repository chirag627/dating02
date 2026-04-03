import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanionService } from './companion.service';
import { CompanionController } from './companion.controller';
import { Companion, CompanionSchema } from './schemas/companion.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Companion.name, schema: CompanionSchema }])],
  controllers: [CompanionController],
  providers: [CompanionService],
  exports: [CompanionService],
})
export class CompanionModule {}
