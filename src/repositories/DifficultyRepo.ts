import { injectable } from "inversify";
import { getConnection } from "typeorm";
import { Difficulty } from "../entity/Difficulty";
import { Quiz } from "../entity/Quiz";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.types";

@injectable()
export class DifficultyRepo implements IDifficultyRepo {
    async initialize(): Promise<void> {
        const requiredDifficulties = ["Easy", "Normal", "Hard"];
        const diffCount = await Difficulty.createQueryBuilder("difficulty")
            .where("type in (:...types)", { types: requiredDifficulties })
            .getCount();

        if (diffCount != 3) {
            await getConnection()
                .createQueryBuilder()
                .insert()
                .into(Difficulty)
                .values(
                    requiredDifficulties.map((difficulty) => ({
                        type: difficulty,
                    }))
                )
                .execute();
        }
    }

    async getQuizzes(type: string): Promise<Quiz[]> {
        const diffObj = await this.getObjByType(type);
        const quizzes = await container
            .get<IQuizRepo>(TYPES.IQuizRepo)
            .findByDifficulty(diffObj.id);
        return quizzes;
    }

    getObjByType(type: string): Promise<Difficulty> {
        return Difficulty.findOne({
            type,
        });
    }

    findById(id: number): Promise<Difficulty> {
        return Difficulty.findOne({
            id,
        });
    }

    findByIds(ids: number[]): Promise<Difficulty[]> {
        return Difficulty.findByIds(ids);
    }
}
