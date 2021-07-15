import { injectable } from "inversify";
import { Difficulty } from "../entity/Difficulty";
import { Quiz } from "../entity/Quiz";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.config";

@injectable()
export class DifficultyRepo implements IDifficultyRepo {
    async initialize(): Promise<void> {
        const difficultyList = await Difficulty.find();
        if (!difficultyList.length) {
            ["Easy", "Normal", "Hard"].forEach(async (type) => {
                const newDiff = Difficulty.create({
                    type,
                });
                await newDiff.save();
            });
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
