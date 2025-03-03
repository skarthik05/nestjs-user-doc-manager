import { AppDataSource } from '../data-source';
import { runSeeds } from './index';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source has been initialized!');

    await runSeeds(AppDataSource);

    await AppDataSource.destroy();
    console.log('Data Source has been destroyed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

void seed();
