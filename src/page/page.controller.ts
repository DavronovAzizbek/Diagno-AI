import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PagesService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post('create')
  createPage(@Body() createPageDto: CreatePageDto): any {
    try {
      const newPage = this.pagesService.create(createPageDto);
      return {
        message: 'Page successfully created!',
        data: newPage,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to create page. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getAll')
  getAllPages(): any {
    try {
      const pages = this.pagesService.findAll();
      return {
        message: 'Pages successfully retrieved!',
        data: pages,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to retrieve pages. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
