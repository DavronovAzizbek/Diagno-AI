import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesController } from './page.controller';
import { PagesService } from './page.service';
import { Page } from './entities/page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Page])],
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
