import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthRolesGuard } from 'src/auth/authRoles.guard';
import { Roles, RoleAdminGuard } from 'src/auth/roleAdmin.guard';
import { RolesUserGuard } from 'src/auth/roleUserGuard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthRolesGuard, RoleAdminGuard)
  @Roles('admin')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthRolesGuard, RoleAdminGuard, RolesUserGuard)
  @Roles('admin', 'user')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(AuthRolesGuard, RoleAdminGuard, RolesUserGuard)
  @Roles('admin', 'user')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(AuthRolesGuard, RoleAdminGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthRolesGuard, RoleAdminGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
