import { Controller, Get, Post, Body } from '@nestjs/common';
import { PagesService } from './page.service';
import { Page } from './entities/page.entity';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}
  @Post()
  async createPage(@Body() body: Partial<Page>) {
    const page = await this.pagesService.createPage(body);
    return {
      message: 'Page created successfully',
      data: page,
    };
  }

  @Get('all')
  async getAllPages() {
    const pages = await this.pagesService.getAllPages();
    return {
      message: 'Pages retrieved successfully',
      data: pages,
    };
  }
}
