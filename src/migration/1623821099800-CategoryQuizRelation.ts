import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class CategoryQuizRelation1623821099800 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createForeignKey(
            "quiz",
            new TableForeignKey({
                columnNames: ["categoryId"],
                referencedColumnNames: ["id"],
                referencedTableName: "category",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("quiz");
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("categoryId") !== -1
        );
        await queryRunner.dropForeignKey("quiz", foreignKey);
    }
}
