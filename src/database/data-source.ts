import { config } from 'dotenv';
import { join } from 'path';
import { DataSource, type DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import {
  ENV_CONSTANTS,
  ENV_CONSTANTS_VALUES,
} from '../constants/env.constants';

config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env[ENV_CONSTANTS.DB_HOST],
  port: parseInt(process.env[ENV_CONSTANTS.DB_PORT] || '5432', 10),
  username: process.env[ENV_CONSTANTS.DB_USERNAME],
  password: process.env[ENV_CONSTANTS.DB_PASSWORD],
  database: process.env[ENV_CONSTANTS.DB_DATABASE],
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, './migrations/**/*{.ts,.js}')],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize:
    process.env[ENV_CONSTANTS.NODE_ENV] === ENV_CONSTANTS_VALUES.LOCAL,
  extra: {
    max: parseInt(process.env[ENV_CONSTANTS.MAX_CONNECTIONS] || '100', 10),
    ssl:
      process.env[ENV_CONSTANTS.DB_SSL_ENABLED] === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  },
};

export const AppDataSource = new DataSource(dataSourceOptions);
