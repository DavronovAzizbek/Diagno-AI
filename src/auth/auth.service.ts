import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, Role } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { VerifyDto } from './dto/verify.dto';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  [x: string]: any;
  userModel: any;
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    const existingAdmin = await this.userRepository.findOne({
      where: { role: Role.ADMIN },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = this.userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        role: Role.ADMIN,
        isVerified: true,
      });

      await this.userRepository.save(admin);
    }
  }

  async register(createAuthDto: CreateAuthDto) {
    if (createAuthDto.role && createAuthDto.role !== Role.USER) {
      throw new BadRequestException('Only users can register');
    }

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
      role: Role.USER,
      verificationCode,
      verificationCodeExpiresAt,
      isVerified: false,
    });

    await this.userRepository.save(user);
    await this.sendVerificationEmail(user.email, verificationCode);

    return {
      message: 'Successfully registered. Verification code sent to email',
    };
  }

  async verifyEmail(verifyDto: VerifyDto): Promise<any> {
    const { email, verificationCode } = verifyDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationCode !== verificationCode) {
      throw new BadRequestException('Invalid verification code');
    }

    if (new Date() > user.verificationCodeExpiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await this.userRepository.save(user);

    return { message: 'Email successfully verified' };
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiresAt = verificationCodeExpiresAt;

    await this.userRepository.save(user);

    await this.sendVerificationEmail(user.email, verificationCode);

    return { message: 'Verification code resent to your email' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    if (user.role !== Role.ADMIN && user.role !== Role.USER) {
      throw new UnauthorizedException('Invalid user role');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      role: user.role,
      isVerified: user.isVerified,
    });

    return { accessToken: token };
  }

  private async sendVerificationEmail(email: string, code: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: email,
      subject: 'Email Verification Code',
      text: `Your verification code is: ${code}`,
    };

    try {
      await transporter.sendMail(mailOptions);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException('Failed to send verification email');
    }
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
