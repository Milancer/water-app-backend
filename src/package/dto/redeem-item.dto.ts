import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class RedeemItemDto {
  @ApiProperty({ description: 'Inventory item ID to redeem' })
  @IsUUID()
  inventoryItemId: string;

  @ApiProperty({ description: 'Quantity to redeem', minimum: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Optional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
