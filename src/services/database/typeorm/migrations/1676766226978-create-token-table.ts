import { MigrationInterface, QueryRunner } from "typeorm";

export class createTokenTable1676766226978 implements MigrationInterface {
    name = 'createTokenTable1676766226978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" character varying NOT NULL, "token" character varying NOT NULL, "expiry" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a8ca5961656d13c16c04079dd3" UNIQUE ("token"), CONSTRAINT "REL_8769073e38c365f315426554ca" UNIQUE ("user_id"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`);
        await queryRunner.query(`DROP TABLE "tokens"`);
    }

}
