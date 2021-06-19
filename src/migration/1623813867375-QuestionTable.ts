import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class QuestionTable1623813867375 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "question",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "question",
                        type: "varchar",
                    },
                    {
                        name: "quizId",
                        type: "int",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("question", true);
    }
}
