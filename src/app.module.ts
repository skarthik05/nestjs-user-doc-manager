import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtRolesGuard } from './guards/auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { FilesModule } from './modules/files/files.module';
import { HealthCheckerModule } from './modules/health-checker/health-checker.module';
import { RolesModule } from './modules/roles/roles.module';
import { UserModule } from './modules/users/users.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService): TypeOrmModuleOptions =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        const dataSource = new DataSource(options);
        await dataSource.initialize();
        addTransactionalDataSource(dataSource);
        return dataSource;
      },
    }),
    SharedModule,
    HealthCheckerModule,
    AuthModule,
    UserModule,
    RolesModule,
    FilesModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtRolesGuard,
    },
  ],
})
export class AppModule {}
