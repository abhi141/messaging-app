import { Body, Controller, Post, Route, Tags, Request } from 'tsoa';
import { LoginRequest, LoginResponse, RegisterRequest } from '../dtos/auth.dto';
import { authService } from '../services/AuthService';
import { RequestContext } from '../types/requestContext';

@Route('auth')
@Tags('Auth')
export class AuthController extends Controller {
  /**
   * Register a new user and receive a JWT token.
   */
  @Post('register')
  public async register(
    @Body() body: RegisterRequest,
    @Request() req: RequestContext
  ): Promise<LoginResponse> {
    return authService.register(body, req.log);
  }

  /**
   * Login with username and password — returns a JWT token.
   */
  @Post('login')
  public async login(
    @Body() body: LoginRequest,
    @Request() req: RequestContext
  ): Promise<LoginResponse> {
    return authService.login(body.username, body.password, req.log);
  }
}
