import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAgent1739961531325 implements MigrationInterface {
  name = 'AddAgent1739961531325'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "agent"
                             (
                                 "id"       character varying NOT NULL,
                                 "name"     character varying NOT NULL,
                                 "bio"      character varying NOT NULL,
                                 "address"  character varying NOT NULL,
                                 "imageUrl" character varying NOT NULL,
                                 CONSTRAINT "PK_agent" PRIMARY KEY ("id")
                             )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No operations
  }

}
