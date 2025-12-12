import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UserModule } from './user/user.module';
import { InventoryModule } from './inventory/inventory.module';
import { Company } from './company/entities/company.entity';
import { User } from './user/entities/user.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { Inventory } from './inventory/entities/inventory.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: './.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');

        if (!username || !password) {
          throw new Error(
            `❌ ENV NOT LOADED. username=${username}, password=${password}`,
          );
        }

        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username,
          password,
          database: configService.get('DB_DATABASE'),
          entities: [Company, User, RefreshToken, Inventory],
          synchronize: true,
        };
      },

      inject: [ConfigService],
    }),
    AuthModule,
    CompanyModule,
    UserModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
