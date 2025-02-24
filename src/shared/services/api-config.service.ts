import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import {
  ENV_CONSTANTS,
  ENV_CONSTANTS_VALUES,
} from 'src/constants/env.constants';
import { NamingStrategyInterface } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === ENV_CONSTANTS_VALUES.DEVELOPMENT;
  }
  get isNotDevelopment(): boolean {
    return !this.isDevelopment;
  }

  get isProduction(): boolean {
    return this.nodeEnv === ENV_CONSTANTS_VALUES.PRODUCTION;
  }

  get isTest(): boolean {
    return this.nodeEnv === ENV_CONSTANTS_VALUES.TEST;
  }
  get isLocal(): boolean {
    return this.nodeEnv === ENV_CONSTANTS_VALUES.LOCAL;
  }

  private get nodeEnv(): string {
    return (
      this.configService.get(ENV_CONSTANTS.NODE_ENV) ??
      ENV_CONSTANTS_VALUES.DEVELOPMENT
    );
  }

  get port(): number {
    return this.configService.get(ENV_CONSTANTS.APP_PORT) ?? 3000;
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);
    try {
      return Boolean(value);
    } catch {
      throw new Error(`${key} environment variable is not a boolean`);
    }
  }
  get documentationEnabled(): boolean {
    return this.getBoolean(ENV_CONSTANTS.ENABLE_DOCUMENTATION);
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);

    if (value == null) {
      throw new Error(`${key} environment variable does not set`);
    }

    return value;
  }

  get apiPrefix(): string {
    return this.get(ENV_CONSTANTS.API_PREFIX);
  }

  private getString(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`${key} environment variable does not set`);
    }
    return value;
  }

  private getNumber(key: string): number {
    const value = this.getString(key);
    try {
      return Number(value);
    } catch {
      throw new Error(`${key} environment variable is not a number`);
    }
  }

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [join(__dirname, '../../database/**/*.entity{.ts,.js}')];
    const migrations = [
      join(__dirname, '../../database/migrations/*{.ts,.js}'),
    ];
    return {
      entities,
      migrations,
      type: 'postgres',
      host: this.getString(ENV_CONSTANTS.DB_HOST),
      port: this.getNumber(ENV_CONSTANTS.DB_PORT),
      username: this.getString(ENV_CONSTANTS.DB_USERNAME),
      password: this.getString(ENV_CONSTANTS.DB_PASSWORD),
      database: this.getString(ENV_CONSTANTS.DB_DATABASE),
      migrationsRun: this.isProduction,
      logging: this.getBoolean(ENV_CONSTANTS.ENABLE_ORM_LOGS),
      namingStrategy: new SnakeNamingStrategy() as NamingStrategyInterface,
      synchronize: this.isLocal,
      extra: {
        max: this.getNumber(ENV_CONSTANTS.MAX_CONNECTIONS) ?? 100,
        ssl:
          this.getString(ENV_CONSTANTS.DB_SSL_ENABLED) === 'true'
            ? { rejectUnauthorized: false }
            : undefined,
      },
    };
  }
}
