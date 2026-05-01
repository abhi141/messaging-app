import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Route,
  Security,
  Tags,
  Request,
  UploadedFile,
} from 'tsoa';
import { ProfileResponse, PublicProfileResponse, UpdateProfileRequest } from '../dtos/profile.dto';
import { profileService } from '../services/ProfileService';
import { rootLogger } from '../config/logger';
import { RequestContext } from '../types/requestContext';

@Route('profile')
@Tags('Profile')
@Security('bearerAuth')
export class ProfileController extends Controller {
  /**
   * Get the authenticated user's full profile (includes avatarBase64).
   */
  @Get('me')
  public async getMyProfile(@Request() req: RequestContext): Promise<ProfileResponse> {
    return profileService.getOwnProfile(req.user.userId, req.log);
  }

  /**
   * Update displayName and/or bio.
   */
  @Patch('me')
  public async updateProfile(
    @Body() body: UpdateProfileRequest,
    @Request() req: RequestContext,
  ): Promise<ProfileResponse> {
    return profileService.updateProfile(req.user.userId, body, req.log);
  }

  /**
   * Upload avatar image (multipart, max 1MB, JPEG/PNG/WebP).
   */
  @Post('me/avatar')
  public async uploadAvatar(
    @UploadedFile() avatar: Express.Multer.File,
    @Request() req: RequestContext,
  ): Promise<ProfileResponse> {
    return profileService.uploadAvatar(req.user.userId, avatar, req.log);
  }

  /**
   * Remove the authenticated user's avatar.
   */
  @Delete('me/avatar')
  public async deleteAvatar(@Request() req: RequestContext): Promise<{ success: boolean }> {
    await profileService.deleteAvatar(req.user.userId, req.log);
    return { success: true };
  }

  /**
   * Get another user's public profile.
   */
  @Get('{userId}')
  public async getPublicProfile(@Path() userId: string, @Request() req: RequestContext): Promise<PublicProfileResponse> {
    return profileService.getPublicProfile(userId, req.log);
  }
}
