import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthRolesGuard } from './authRoles.guard';
import { Response, Request } from 'express';
import { VerificationDto } from './dto/verification.dto';
import { Role } from './entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Body('role') role: Role,
  ) {
    if (!role || ![Role.ADMIN, Role.USER].includes(role)) {
      throw new UnauthorizedException('Invalid role');
    }
    return this.authService.register(createAuthDto, role);
  }

  @Post('send-verification-code')
  async sendVerificationCode(@Body() body: VerificationDto) {
    return this.authService.sendVerificationCode(body.email);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body() body: VerificationDto) {
    return this.authService.resendVerificationCode(body.email);
  }

  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.login(loginDto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 kun
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken: _, ...sanitizedUser } = user;

    return res.status(200).json({ accessToken, user: sanitizedUser });
  }

  @UseGuards(AuthRolesGuard)
  @Post('refresh-token')
  async refreshAccessToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing ❌');
    }
    const { accessToken, newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ accessToken });
  }

  @UseGuards(AuthRolesGuard)
  @Delete('logout')
  async logout(@Res() res: Response, @Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing ❌');
    }

    await this.authService.logout(refreshToken);

    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'User successfully logged out' });
  }
}
