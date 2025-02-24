import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ENV_CONSTANTS,
  ENV_CONSTANTS_VALUES,
} from 'src/constants/env.constants';

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
}
