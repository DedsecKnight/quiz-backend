import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class QuestionAnswerRelation1623818671265 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "answer",
            new TableForeignKey({
                columnNames: ["questionId"],
                referencedColumnNames: ["id"],
                referencedTableName: "question",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("answer");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("questionId") !== -1
        );
        await queryRunner.dropForeignKey("answer", foreignKey);
    }
}
