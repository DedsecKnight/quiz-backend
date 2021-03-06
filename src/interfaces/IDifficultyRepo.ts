import { Difficulty } from "../entity/Difficulty";
import { Quiz } from "../entity/Quiz";

export interface IDifficultyRepo {
    // Create 3 objects corresponding to "Easy", "Normal", "Hard" if not exists
    initialize: () => Promise<void>;

    // Get all quizzes that have certain difficulty
    // type - name of difficulty (Easy | Normal | Hard)
    getQuizzes: (type: string) => Promise<Quiz[]>;

    // Find Difficulty object by given name
    // type - name of difficulty (Easy | Normal | Hard)
    getObjByType: (type: string) => Promise<Difficulty>;

    // Find Difficulty object by id
    // id: id of target object
    findById: (id: number) => Promise<Difficulty>;

    // Find Difficulty objects based on list of ids
    // ids: list of ids
    findByIds: (ids: number[]) => Promise<Difficulty[]>;
}
