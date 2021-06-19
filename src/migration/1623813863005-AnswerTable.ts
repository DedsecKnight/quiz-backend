import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AnswerTable1623813863005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "answer",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "answer",
                        type: "varchar",
                    },
                    {
                        name: "isCorrect",
                        type: "boolean",
                    },
                    {
                        name: "questionId",
                        type: "int",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("answer", true);
    }
}
