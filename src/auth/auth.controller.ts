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
import { VerifyDto } from './dto/verify.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
    const response = await this.authService.register(createAuthDto);
    return res.status(201).json(response);
  }

  @Post('verify')
  async verifyEmail(@Body() verifyDto: VerifyDto, @Res() res: Response) {
    const response = await this.authService.verifyEmail(verifyDto);
    return res.status(200).json(response);
  }

  @Post('resend-verification-code')
  async resendVerificationCode(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const response = await this.authService.login(loginDto);
    return res.status(200).json(response);
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
