import { Difficulty } from "../entity/Difficulty";

export interface IDifficultyRepo {
    initialize: () => Promise<void>;
    getQuizzes: (type: string) => Promise<Difficulty | null>;
}
