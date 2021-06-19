import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class QuizQuestionRelation1623819025699 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "question",
            new TableForeignKey({
                columnNames: ["quizId"],
                referencedColumnNames: ["id"],
                referencedTableName: "quiz",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("question");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("quizId") !== -1
        );
        await queryRunner.dropForeignKey("question", foreignKey);
    }
}
