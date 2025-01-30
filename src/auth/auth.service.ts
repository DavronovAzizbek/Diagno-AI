import {
  BadRequestException,
  // BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  // NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { VerifyDto } from './dto/verify.dto';

@Injectable()
export class AuthService {
  [x: string]: any;
  userModel: any;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createAuthDto: CreateAuthDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = this.userRepository.create({
      email: createAuthDto.email,
      password: hashedPassword,
      role: createAuthDto.role,
      verificationCode,
      verificationCodeExpiresAt,
    });

    await this.userRepository.save(user);
    await this.sendVerificationEmail(user.email, verificationCode);

    if (user.role === Role.ADMIN || user.role === Role.USER) {
      this.adminUsers.add(user.email);
    }

    return {
      message: 'Successfully registered. Verification code sent to email',
    };
  }

  async verifyEmail(verifyDto: VerifyDto) {
    const { email, code } = verifyDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      user.verificationCode !== code ||
      user.verificationCodeExpiresAt < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    user.isVerified = true;
    user.verificationCode = null;
    await this.userRepository.save(user);
    return { message: 'Email successfully verified' };
  }

  async resendVerificationCode(resendVerifyDto: ResendVerifyDto) {
    const { email } = resendVerifyDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }

    user.verificationCode = crypto.randomInt(100000, 999999).toString();
    user.verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.save(user);
    await this.sendVerificationEmail(user.email, user.verificationCode);
    return { message: 'New verification code sent' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const accessToken = this.jwtService.sign({ id: user.id, role: user.role });
    return {
      accessToken,
      role: user.role,
      isAdminUser: this.adminUsers.has(email),
    };
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; newRefreshToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newAccessToken = this.jwtService.sign({
        id: user.id,
        role: user.role,
      });

      const newRefreshToken = this.jwtService.sign(
        { id: user.id },
        { expiresIn: '30d' },
      );
      user.refreshToken = newRefreshToken;
      await this.userRepository.save(user);

      return { accessToken: newAccessToken, newRefreshToken };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(token: string): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found or invalid token ❌');
      }

      user.refreshToken = null;
      await this.userRepository.save(user);

      return { message: 'Successfully logged out' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Token is invalid or expired ❌');
    }
  }
}
