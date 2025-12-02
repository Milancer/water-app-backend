import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthService } from '../auth/auth.service';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser?: User): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role and company assignment
    const role = createUserDto.role || UserRole.User;

    if (role === UserRole.SuperAdmin && createUserDto.companyId) {
      throw new BadRequestException('SuperAdmin cannot be assigned to a company');
    }

    if (role !== UserRole.SuperAdmin && !createUserDto.companyId) {
      throw new BadRequestException('CompanyAdmin and User must be assigned to a company');
    }

    // If current user is CompanyAdmin, ensure new user is in same company
    if (currentUser && currentUser.role === UserRole.CompanyAdmin) {
      if (createUserDto.companyId !== currentUser.companyId) {
        throw new ForbiddenException('You can only create users in your own company');
      }
      if (role === UserRole.SuperAdmin || role === UserRole.CompanyAdmin) {
        throw new ForbiddenException('CompanyAdmin cannot create SuperAdmin or CompanyAdmin users');
      }
    }

    // Hash password
    const hashedPassword = await this.authService.hashPassword(createUserDto.password);

    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async findAll(currentUser: User): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.company', 'company');

    // SuperAdmin can see all users
    if (currentUser.role === UserRole.SuperAdmin) {
      return query.orderBy('user.createdAt', 'DESC').getMany();
    }

    // CompanyAdmin and User can only see users in their company
    if (currentUser.companyId) {
      query.where('user.companyId = :companyId', { companyId: currentUser.companyId });
    }

    return query.orderBy('user.createdAt', 'DESC').getMany();
  }

  async findOne(id: string, currentUser: User): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // SuperAdmin can access any user
    if (currentUser.role === UserRole.SuperAdmin) {
      return user;
    }

    // Other users can only access users in their company
    if (user.companyId !== currentUser.companyId) {
      throw new ForbiddenException('You do not have access to this user');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<User> {
    const user = await this.findOne(id, currentUser);

    // CompanyAdmin cannot update SuperAdmin or CompanyAdmin users
    if (currentUser.role === UserRole.CompanyAdmin) {
      if (user.role === UserRole.SuperAdmin || user.role === UserRole.CompanyAdmin) {
        throw new ForbiddenException('You cannot update SuperAdmin or CompanyAdmin users');
      }
    }

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
    }

    // Validate role and company changes
    if (updateUserDto.role) {
      if (updateUserDto.role === UserRole.SuperAdmin && user.companyId) {
        throw new BadRequestException('Cannot change user to SuperAdmin while assigned to a company');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const user = await this.findOne(id, currentUser);

    // CompanyAdmin cannot delete SuperAdmin or CompanyAdmin users
    if (currentUser.role === UserRole.CompanyAdmin) {
      if (user.role === UserRole.SuperAdmin || user.role === UserRole.CompanyAdmin) {
        throw new ForbiddenException('You cannot delete SuperAdmin or CompanyAdmin users');
      }
    }

    await this.userRepository.remove(user);
  }
}
