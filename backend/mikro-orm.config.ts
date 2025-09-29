import { config } from 'dotenv';
config();

import { Options } from '@mikro-orm/core';
import { SeedManager } from '@mikro-orm/seeder';
import { UnderscoreNamingStrategy } from '@mikro-orm/core';
import { DatabaseSeeder } from './src/seeders/DatabaseSeeder';

const ormConfig: Options = {
  extensions: [SeedManager],
  entities:
    process.env.NODE_ENV === 'production'
      ? ['./dist/src/entities/*.entity.js']
      : ['./src/entities/*.entity.ts'],
  type: 'sqlite',
  dbName: process.env.DB_NAME || './database.sqlite',
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext:
    process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined,
  namingStrategy: UnderscoreNamingStrategy,
  migrations: {
    path: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    allOrNothing: true,
    snapshot: false,
  },
  seeder: {
    path: './src/seeders',
    pathTs: './src/seeders',
    defaultSeeder: 'DatabaseSeeder',
    glob: '!(*.d).{js,ts}',
    emit: 'ts',
    fileName: (className: string) => className,
  },
};

console.log('Database config:', {
  dbName: ormConfig.dbName,
  type: ormConfig.type,
  env: process.env.NODE_ENV,
});

export default ormConfig;