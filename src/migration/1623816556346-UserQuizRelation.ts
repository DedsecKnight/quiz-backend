import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class UserQuizRelation1623816556346 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "quiz",
            new TableForeignKey({
                columnNames: ["authorId"],
                referencedColumnNames: ["id"],
                referencedTableName: "user",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("quiz");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("authorId") !== -1
        );
        await queryRunner.dropForeignKey("quiz", foreignKey);
    }
}
