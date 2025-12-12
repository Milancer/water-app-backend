import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PackageItemDto {
  @ApiProperty({ description: 'Inventory item ID' })
  @IsUUID()
  @IsNotEmpty()
  inventoryItemId: string;

  @ApiProperty({
    description: 'Quantity of this item in the package',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreatePackageDto {
  @ApiProperty({ description: 'Package name', example: '10 Water Bottles' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Package description',
    example: 'Loyalty package with 10 bottles of water',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Items included in this package',
    type: [PackageItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageItemDto)
  items: PackageItemDto[];
}
