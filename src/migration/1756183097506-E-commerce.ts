import { MigrationInterface, QueryRunner } from "typeorm";

export class ECommerce1756183097506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(``); //example query
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(``); //example query to revert the changes made in up method
  }
}

//up is for adding the changes
//down is for reverting the changes
//any change in the entity should be reflected here in database migration file
