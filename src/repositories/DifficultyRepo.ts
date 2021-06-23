import { injectable } from "inversify";
import { Difficulty } from "../entity/Difficulty";
import { Quiz } from "../entity/Quiz";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";

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
        const diffObj = await Difficulty.findOne({
            relations: [
                "quizzes",
                "quizzes.questions",
                "quizzes.questions.answers",
                "quizzes.category",
            ],
            where: {
                type,
            },
        });
        if (!diffObj) return [];
        return diffObj.quizzes;
    }

    async getObjByType(type: string): Promise<Difficulty> {
        return Difficulty.findOne({
            type,
        });
    }
}
