import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { AuthRolesGuard, Roles } from 'src/auth/authRoles.guard';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @UseGuards(AuthRolesGuard)
  @Roles('admin')
  @Post()
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    try {
      const doctor = await this.doctorService.create(createDoctorDto);
      return {
        message: 'Doctor created successfully',
        doctor,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to create doctor');
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('admin')
  @Get()
  async findAll() {
    try {
      const doctors = await this.doctorService.findAll();
      return {
        message: 'Doctors fetched successfully',
        doctors,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch doctors');
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('admin')
  @Get(':id')
  async findOne(@Param('id') id: number) {
    try {
      const doctor = await this.doctorService.findOne(id);
      return {
        message: `Doctor with ID ${id} fetched successfully`,
        doctor,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateDoctorDto: UpdateDoctorDto,
  ) {
    try {
      const updatedDoctor = await this.doctorService.update(
        id,
        updateDoctorDto,
      );
      return {
        message: `Doctor with ID ${id} updated successfully`,
        updatedDoctor,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update doctor with ID ${id}`,
      );
    }
  }

  @UseGuards(AuthRolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: number) {
    try {
      await this.doctorService.remove(id);
      return { message: `Doctor with ID ${id} has been deleted successfully` };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete doctor with ID ${id}`,
      );
    }
  }
}
