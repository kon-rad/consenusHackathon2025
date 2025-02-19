import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMetadataToAgent1739968247165 implements MigrationInterface {
  name = 'AddMetadataToAgent1739968247165'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "agent"
        ADD "metadata" jsonb NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No operations
  }

}
