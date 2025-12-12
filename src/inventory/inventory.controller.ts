import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/entities/user.entity';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CompanyAdmin)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new inventory item (CompanyAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item successfully created',
  })
  @ApiResponse({
    status: 409,
    description: 'Stock code already exists for this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CompanyAdmin role',
  })
  create(
    @Body() createInventoryDto: CreateInventoryDto,
    @CurrentUser() user: User,
  ) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.inventoryService.create(createInventoryDto, user.companyId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all inventory items for your company (CompanyAdmin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all inventory items for the company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CompanyAdmin role',
  })
  findAll(@CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.inventoryService.findAll(user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID (CompanyAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Inventory item UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory item details',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CompanyAdmin role',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.inventoryService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item (CompanyAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Inventory item UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory item successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Stock code already exists for this company',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CompanyAdmin role',
  })
  update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @CurrentUser() user: User,
  ) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.inventoryService.update(id, updateInventoryDto, user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete inventory item (CompanyAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Inventory item UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory item successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires CompanyAdmin role',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.inventoryService.remove(id, user.companyId);
  }
}
