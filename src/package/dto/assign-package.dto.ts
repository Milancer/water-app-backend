import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsNotEmpty } from 'class-validator';

export class AssignPackageDto {
  @ApiProperty({
    description: 'User IDs to assign this package to',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID(undefined, { each: true })
  userIds: string[];
}
