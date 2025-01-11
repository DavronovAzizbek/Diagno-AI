import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async createPage(data: Partial<Page>): Promise<Page> {
    const page = this.pageRepository.create(data);
    return this.pageRepository.save(page);
  }

  async getAllPages(): Promise<Page[]> {
    return this.pageRepository.find();
  }
}
