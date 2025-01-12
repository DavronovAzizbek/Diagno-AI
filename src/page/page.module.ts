import { Module } from '@nestjs/common';
import { PagesService } from './page.service';
import { PagesController } from './page.controller';

@Module({
  controllers: [PagesController],
  providers: [PagesService],
})
export class PagesModule {}
