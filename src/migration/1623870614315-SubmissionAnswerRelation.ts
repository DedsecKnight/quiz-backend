import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from "typeorm";

export class SubmissionAnswerRelation1623870614315
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "submission_answer",
                columns: [
                    {
                        name: "submissionId",
                        type: "int",
                    },
                    {
                        name: "answerId",
                        type: "int",
                    },
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                ],
            }),
            true
        );
        await queryRunner.createForeignKeys("submission_answer", [
            new TableForeignKey({
                columnNames: ["submissionId"],
                referencedColumnNames: ["id"],
                referencedTableName: "submission",
            }),
            new TableForeignKey({
                columnNames: ["answerId"],
                referencedColumnNames: ["id"],
                referencedTableName: "answer",
            }),
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("submission_answer");
        const submissionKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("submissionId") !== -1
        );
        const answerKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("answerId") !== -1
        );
        await queryRunner.dropForeignKeys("submission_answer", [
            submissionKey,
            answerKey,
        ]);
        await queryRunner.dropTable("submission_answer");
    }
}
