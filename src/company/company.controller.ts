import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@ApiTags('Companies')
@ApiBearerAuth()
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Create a new company (SuperAdmin only)' })
  @ApiResponse({
    status: 201,
    description: 'Company successfully created',
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires SuperAdmin role',
  })
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Get('public')
  @ApiOperation({
    summary: 'Get all companies (public endpoint for registration)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all companies',
  })
  findAllPublic() {
    return this.companyService.findAll();
  }

  @Get()
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get all companies (SuperAdmin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of all companies',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires SuperAdmin role',
  })
  findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Get company by ID (SuperAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Company UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Company details',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires SuperAdmin role',
  })
  findOne(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Update company (SuperAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Company UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Company successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Company with this name already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires SuperAdmin role',
  })
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.SuperAdmin)
  @ApiOperation({ summary: 'Delete company (SuperAdmin only)' })
  @ApiParam({
    name: 'id',
    description: 'Company UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Company successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - requires SuperAdmin role',
  })
  remove(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}
