import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { UserRole } from './user/enums/user-role.enum';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userService = app.get(UserService);
  const authService = app.get(AuthService);

  try {
    // Check if SuperAdmin already exists
    const existingSuperAdmin = await userService.findByEmail('superadmin@waterapp.com');

    if (existingSuperAdmin) {
      console.log('✅ SuperAdmin already exists');
      console.log('   Email: superadmin@waterapp.com');
    } else {
      // Create SuperAdmin
      const hashedPassword = await authService.hashPassword('SuperAdmin123!');
      
      const superAdmin = await userService.create({
        email: 'superadmin@waterapp.com',
        password: 'SuperAdmin123!',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SuperAdmin,
      });

      console.log('✅ SuperAdmin created successfully!');
      console.log('   Email: superadmin@waterapp.com');
      console.log('   Password: SuperAdmin123!');
      console.log('   ID:', superAdmin.id);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  } finally {
    await app.close();
  }
}

seed();
