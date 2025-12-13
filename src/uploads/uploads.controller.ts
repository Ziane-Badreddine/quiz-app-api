/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { UserRole } from 'generated/prisma/enums';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CloudinaryService } from './cloudinary.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { CurrentUserType } from 'src/types/user';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('*path')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
      fileFilter: (req, file, cb) => {
        // Validation du type de fichier
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
    }),
  )
  async uploadDynamic(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    let fullPath = req.params.path;

    if (Array.isArray(fullPath)) {
      fullPath = fullPath.join('/');
    }

    if (!fullPath || typeof fullPath !== 'string') {
      throw new BadRequestException('Invalid path');
    }

    const parts = fullPath.split('/');
    const firstFolder = parts[0];

    const allowedBucket = ['users'];
    const privateBucket = ['categories', 'quizzes'];

    if (
      !allowedBucket.includes(firstFolder) &&
      !privateBucket.includes(firstFolder)
    ) {
      throw new BadRequestException('Invalid folder');
    }

    const userRole = req.session.user?.role;

    if (userRole !== UserRole.ADMIN && privateBucket.includes(firstFolder)) {
      throw new ForbiddenException('Access denied');
    }

    try {
      // Upload vers Cloudinary
      const result = await this.cloudinaryService.uploadFile(file, fullPath);

      return {
        message: 'Uploaded successfully',
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
      };
    } catch {
      throw new BadRequestException('Failed to upload file');
    }
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteFile(
    @Body('publicId') publicId: string,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    if (!publicId) {
      throw new BadRequestException('Public ID is required');
    }

    const parts = publicId.split('/');
    const firstFolder = parts[0];
    const privateBucket = ['categories', 'quizzes'];
    const userRole = currentUser.role;

    if (userRole !== UserRole.ADMIN && privateBucket.includes(firstFolder)) {
      throw new ForbiddenException('Access denied');
    }

    try {
      const result = await this.cloudinaryService.deleteFile(publicId);
      return {
        message: 'File deleted successfully',
        result,
      };
    } catch {
      throw new BadRequestException('Failed to delete file');
    }
  }
}
