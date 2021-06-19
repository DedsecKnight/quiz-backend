import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class DifficultyQuizRelation1623817252113 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "quiz",
            new TableForeignKey({
                columnNames: ["difficultyId"],
                referencedColumnNames: ["id"],
                referencedTableName: "difficulty",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("quiz");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("difficultyId") !== -1
        );
        await queryRunner.dropForeignKey("quiz", foreignKey);
    }
}
