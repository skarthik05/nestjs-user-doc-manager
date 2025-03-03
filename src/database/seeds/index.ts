import { type DataSource } from 'typeorm';

import { seedRoles } from './role.seed';

export async function runSeeds(dataSource: DataSource): Promise<void> {
  try {
    console.log('Starting database seeds...');

    await seedRoles(dataSource);

    console.log('All seeds completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  }
}
