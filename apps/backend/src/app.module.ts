import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClsModule } from 'nestjs-cls';
import { AuthGuard } from 'auth/auth.guard';
import { TenantsModule } from 'models/tenants/tenants.module';
import { UsersModule } from 'models/users/users.module';
import { PatientsModule } from 'models/patients/patients.module';
import { AuthModule } from 'auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaTenancyModule } from 'prisma-tenancy';
import { AppController } from 'app.controller';

@Module({
  imports: [
    PrismaTenancyModule,
    TenantsModule,
    UsersModule,
    PatientsModule,
    AuthModule,
    ConfigModule.forRoot(),
    ClsModule.forRoot()
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    }
  ],
  controllers: [AppController]
})
export class AppModule { }