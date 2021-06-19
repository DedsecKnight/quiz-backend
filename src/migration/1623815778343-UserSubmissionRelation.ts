import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class UserSubmissionRelation1623815778343 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "submission",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("submission");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("userId") !== -1
        );
        await queryRunner.dropForeignKey("submission", foreignKey);
    }
}
