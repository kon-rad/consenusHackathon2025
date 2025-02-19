import * as path from 'path';
import * as fs from 'fs/promises';

const migrationsDir = path.join(__dirname, '..', 'migrations');
const migrationName = process.argv[2];

const start = async () => {
  const files = await fs.readdir(migrationsDir);
  const migrationFileName = files.reverse().find((file) => file.includes(migrationName));

  if (migrationFileName) {
    console.log(`Found migration file: ${migrationFileName}`);
  } else {
    throw new Error(`Migration file with name ${migrationName} not found.`);
  }

  const migrationFilePath = path.join(migrationsDir, migrationFileName);
  const data = await fs.readFile(migrationFilePath, { encoding: 'utf8' });

  const lines = data.split('\n');

  // Remove DROP CONSTRAINT commands
  const cleanedLines = lines.filter((line) => !line.includes('DROP CONSTRAINT'));
  let cleanedData = cleanedLines.join('\n');

  // Clean down method
  const downMethodRegex = /public async down\(queryRunner: QueryRunner\): Promise<void> {([\s\S]*?)}/;
  const cleanDownMethod = 'public async down(queryRunner: QueryRunner): Promise<void> {\n    // No operations\n  }';
  cleanedData = cleanedData.replace(downMethodRegex, cleanDownMethod);

  try {
    await fs.writeFile(migrationFilePath, cleanedData, 'utf8');
    console.log(`Successfully cleaned migration file: ${migrationFileName}`);
  } catch (err) {
    console.error(`Error writing file: ${err.message}`);
  }
};

start();
