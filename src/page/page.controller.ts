import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PagesService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { RolesUserGuard } from 'src/auth/roleUserGuard';
import { AuthRolesGuard, Roles } from 'src/auth/authRoles.guard';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @UseGuards(RolesUserGuard)
  @Roles('user')
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

  @UseGuards(RolesUserGuard)
  @Roles('user')
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

  @UseGuards(AuthRolesGuard)
  @Roles('admin', 'user')
  @Put('update/:id')
  updatePageName(@Param('id') id: string, @Body('name') name: string): any {
    try {
      const updatedPage = this.pagesService.updatePageName(Number(id), name);
      return {
        message: 'Page name successfully updated!',
        data: updatedPage,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            message: 'Page not found.',
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to update page name. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('admin', 'user')
  @Delete('delete/:id')
  deletePage(@Param('id') id: string): any {
    try {
      const result = this.pagesService.deletePage(Number(id));
      return {
        message: 'Page successfully deleted!',
        data: result,
      };
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          {
            message: 'Page not found.',
            error: error.message,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        {
          message: 'Failed to delete page. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
