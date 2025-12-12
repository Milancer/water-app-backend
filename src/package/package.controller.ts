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
} from '@nestjs/swagger';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { AssignPackageDto } from './dto/assign-package.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { User } from '../user/entities/user.entity';

@ApiTags('packages')
@ApiBearerAuth()
@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({ status: 201, description: 'Package created successfully' })
  create(
    @Body() createPackageDto: CreatePackageDto,
    @CurrentUser() user: User,
  ) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.create(createPackageDto, user.companyId);
  }

  @Get()
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get all packages for company' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  findAll(@CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.findAll(user.companyId);
  }

  @Get(':id')
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiResponse({ status: 200, description: 'Package retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.findOne(id, user.companyId);
  }

  @Patch(':id')
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Update a package' })
  @ApiResponse({ status: 200, description: 'Package updated successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @CurrentUser() user: User,
  ) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.update(id, updatePackageDto, user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Delete a package' })
  @ApiResponse({ status: 200, description: 'Package deleted successfully' })
  @ApiResponse({ status: 404, description: 'Package not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    await this.packageService.remove(id, user.companyId);
    return { message: 'Package deleted successfully' };
  }

  @Post(':id/assign')
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Assign package to users' })
  @ApiResponse({ status: 201, description: 'Package assigned successfully' })
  assignToUsers(
    @Param('id') id: string,
    @Body() assignPackageDto: AssignPackageDto,
    @CurrentUser() user: User,
  ) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.assignToUsers(
      id,
      assignPackageDto,
      user.companyId,
    );
  }

  @Get(':id/users')
  @Roles(UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get users assigned to package' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  getPackageUsers(@Param('id') id: string, @CurrentUser() user: User) {
    if (!user.companyId) {
      throw new ForbiddenException('User must belong to a company');
    }
    return this.packageService.getPackageUsers(id, user.companyId);
  }

  // Mobile User Endpoints
  @Get('my-packages')
  @Roles(UserRole.User, UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get my assigned packages' })
  @ApiResponse({ status: 200, description: 'Packages retrieved successfully' })
  getMyPackages(@CurrentUser() user: User) {
    return this.packageService.getMyPackages(user.id);
  }

  @Get('user-package/:id')
  @Roles(UserRole.User, UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get user package details' })
  @ApiResponse({
    status: 200,
    description: 'Package details retrieved successfully',
  })
  getUserPackageDetails(@Param('id') id: string, @CurrentUser() user: User) {
    return this.packageService.getUserPackageDetails(id, user.id);
  }

  @Post('user-package/:id/redeem')
  @Roles(UserRole.User, UserRole.CompanyAdmin, UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Redeem an item from package' })
  @ApiResponse({ status: 201, description: 'Item redeemed successfully' })
  redeemItem(
    @Param('id') id: string,
    @Body() redeemItemDto: any,
    @CurrentUser() user: User,
  ) {
    return this.packageService.redeemItem(id, redeemItemDto, user.id);
  }
}
