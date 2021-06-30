import { Category } from "../entity/Category";
import { Quiz } from "../entity/Quiz";

export interface ICategoryRepo {
    // Find a Category object with categoryName, if object does not exist, then create a new object with categoryName
    findOrCreate(categoryName: string): Promise<Category>;

    // Get all quizzes with given category
    getQuizzes(categoryName: string): Promise<Quiz[]>;
}
