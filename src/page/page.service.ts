import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PagesService {
  private pages: Page[] = [];
  private idCounter = 1;

  create(createPageDto: CreatePageDto): Page {
    try {
      const slug = uuidv4();
      const newPage: Page = {
        id: this.idCounter++,
        name: createPageDto.name || 'untitled',
        path: createPageDto.path || `new-chat/${slug}`,
        isFavorite: createPageDto.isFavorite || false,
        content: createPageDto.content,
        createAt: new Date(),
        updateAt: new Date(),
      };

      this.pages.push(newPage);
      return newPage;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create page. Please try again later.',
        error.message,
      );
    }
  }

  findAll(): Page[] {
    try {
      return this.pages;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve pages. Please try again later.',
        error.message,
      );
    }
  }

  deletePage(id: number): Page {
    try {
      const pageIndex = this.pages.findIndex((page) => page.id === id);
      if (pageIndex === -1) {
        throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
      }

      const deletedPage = this.pages[pageIndex];
      this.pages.splice(pageIndex, 1);
      return deletedPage;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to delete page. Please try again later.',
        error.message,
      );
    }
  }
}
