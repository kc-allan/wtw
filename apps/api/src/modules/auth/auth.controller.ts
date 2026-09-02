import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiZodBody } from '../../core/http/api-zod';
import { zodBody } from '../../core/http/zod-validation.pipe';
import { CurrentUser, type AuthenticatedUser } from '../../core/auth/current-user.decorator';
import { Public } from '../../core/auth/public.decorator';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type LoginInput,
  type RefreshInput,
  type RegisterInput,
} from './auth.schemas';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a host account and its personal workspace' })
  @ApiZodBody(registerSchema, 'Register')
  register(@Body(zodBody(registerSchema)) body: RegisterInput) {
    return this.auth.register(body);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange credentials for an access and refresh token' })
  @ApiZodBody(loginSchema, 'Login')
  login(@Body(zodBody(loginSchema)) body: LoginInput) {
    return this.auth.login(body);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token for a new pair' })
  @ApiZodBody(refreshSchema, 'Refresh')
  refresh(@Body(zodBody(refreshSchema)) body: RefreshInput) {
    return this.auth.refresh(body.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiZodBody(refreshSchema, 'Logout')
  async logout(@Body(zodBody(refreshSchema)) body: RefreshInput): Promise<void> {
    await this.auth.logout(body.refreshToken);
  }

  @Get('me')
  @ApiOperation({ summary: 'The signed-in host' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
