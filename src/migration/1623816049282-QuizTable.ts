import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class QuizTable1623816049282 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "quiz",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "quizName",
                        type: "varchar",
                    },
                    {
                        name: "authorId",
                        type: "int",
                    },
                    {
                        name: "difficultyId",
                        type: "int",
                    },
                    {
                        name: "categoryId",
                        type: "int",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("quiz", true);
    }
}
