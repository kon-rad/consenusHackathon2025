import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { entities } from './entities';
import * as path from 'path';

config({ path: `.env` });
config({ path: `.env.local`, override: true });

export const typeOrmOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_DATABASE_HOST,
  port: process.env.POSTGRES_DATABASE_PORT,
  username: process.env.POSTGRES_DATABASE_USER,
  password: process.env.POSTGRES_DATABASE_PASSWORD,
  database: process.env.POSTGRES_DATABASE_NAME,
  migrations: [path.resolve(__dirname, '../migrations/*{.ts,.js}')],
  entities: entities,
} as unknown as DataSourceOptions;

export const dataSource = new DataSource(typeOrmOptions);
