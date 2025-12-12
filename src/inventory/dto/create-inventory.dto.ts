import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({
    description: 'Unique stock code for the inventory item',
    example: 'SKU-001',
  })
  @IsString()
  @IsNotEmpty()
  stockCode: string;

  @ApiProperty({
    description: 'Name of the inventory item',
    example: 'Water Bottle 500ml',
  })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    description: 'Detailed description of the item',
    example: 'Spring water in 500ml PET bottles',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Quantity in stock',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'pieces',
  })
  @IsString()
  @IsNotEmpty()
  unit: string;
}
