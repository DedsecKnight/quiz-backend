import { Difficulty } from "../entity/Difficulty";
import { Quiz } from "../entity/Quiz";

export interface IDifficultyRepo {
    initialize: () => Promise<void>;
    getQuizzes: (type: string) => Promise<Quiz[]>;
    getObjByType: (type: string) => Promise<Difficulty>;
}
