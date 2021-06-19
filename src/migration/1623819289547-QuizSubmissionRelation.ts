import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class QuizSubmissionRelation1623819289547 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "submission",
            new TableForeignKey({
                columnNames: ["quizId"],
                referencedColumnNames: ["id"],
                referencedTableName: "quiz",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("submission");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("quizId") !== -1
        );
        await queryRunner.dropForeignKey("submission", foreignKey);
    }
}
