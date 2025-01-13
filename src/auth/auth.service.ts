import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Parollarni solishtirish funksiyasi
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async register(createAuthDto: CreateAuthDto, role: Role) {
    const existingUser = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepository.create({
      email: createAuthDto.email,
      password: await bcrypt.hash(createAuthDto.password, 10),
      role,
    });

    await this.userRepository.save(user);
    return { message: `${role} successfully registered` };
  }

  async sendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString(); // Tasdiqlash kodi yaratish (6 xonali)
    user.verificationCode = verificationCode;
    await this.userRepository.save(user);

    // Email orqali yuborish (nodemailer)
    await this.sendEmail(
      user.email,
      'Tasdiqlash kodi',
      `Tasdiqlash kodingiz: ${verificationCode}`,
    );
    return { message: 'Verification code sent to email' };
  }

  async resendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString(); // Yangi kod yaratish
    user.verificationCode = verificationCode;
    await this.userRepository.save(user);

    // Email orqali yuborish
    await this.sendEmail(
      user.email,
      'Qayta tasdiqlash kodi',
      `Tasdiqlash kodingiz: ${verificationCode}`,
    );
    return { message: 'Verification code resent to email' };
  }

  private async sendEmail(to: string, subject: string, body: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });
  }

  async login(loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password ❌');
    }

    const isPasswordValid = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password ❌');
    }

    const accessToken = this.jwtService.sign({ id: user.id, role: user.role });
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: '30d' },
    );

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken, user };
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

      return { message: 'User successfully logged out' };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new UnauthorizedException('Token is invalid or expired ❌');
    }
  }
}
