import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryProvider } from './cloudinary.config';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
