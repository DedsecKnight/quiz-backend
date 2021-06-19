import { EntityRepository, Repository } from "typeorm";
import { Difficulty } from "../entity/Difficulty";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";

@EntityRepository(Difficulty)
export class DifficultyRepo
    extends Repository<Difficulty>
    implements IDifficultyRepo
{
    async initialize(): Promise<void> {
        const difficultyList = await this.find();
        if (!difficultyList.length) {
            ["Easy", "Normal", "Hard"].forEach(async (type) => {
                const newDiff = Difficulty.create({
                    type,
                });
                await newDiff.save();
            });
        }
    }

    async getQuizzes(type: string): Promise<Difficulty | null> {
        const difficultyObj = await this.findOne(
            {
                type,
            },
            {
                relations: [
                    "quizzes",
                    "quizzes.questions",
                    "quizzes.questions.answers",
                    "quizzes.category",
                ],
            }
        );
        if (!difficultyObj) return null;
        return difficultyObj;
    }
}
