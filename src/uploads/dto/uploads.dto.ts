import { ApiProperty } from '@nestjs/swagger';

export class UploadsDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    name: 'file',
  })
  file: Express.Multer.File;
}
