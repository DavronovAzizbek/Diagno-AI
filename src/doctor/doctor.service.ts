import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    try {
      const doctor = this.doctorRepository.create(createDoctorDto);
      const savedDoctor = await this.doctorRepository.save(doctor);
      return savedDoctor;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to create doctor');
    }
  }

  async findAll(): Promise<Doctor[]> {
    try {
      const doctors = await this.doctorRepository.find();
      return doctors;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch doctors');
    }
  }

  async findOne(id: number): Promise<Doctor> {
    try {
      const doctor = await this.doctorRepository.findOne({ where: { id } });
      if (!doctor) {
        throw new NotFoundException(`Doctor with ID ${id} not found`);
      }
      return doctor;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to fetch doctor with ID ${id}`,
      );
    }
  }

  async update(id: number, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    try {
      const doctor = await this.findOne(id);
      Object.assign(doctor, updateDoctorDto);
      const updatedDoctor = await this.doctorRepository.save(doctor);
      return updatedDoctor;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update doctor with ID ${id}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const doctor = await this.findOne(id);
      await this.doctorRepository.remove(doctor);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete doctor with ID ${id}`,
      );
    }
  }
}
