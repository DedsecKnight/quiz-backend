import { Category } from "../entity/Category";
import { Quiz } from "../entity/Quiz";

export interface ICategoryRepo {
    findOrCreate(categoryName: string): Promise<Category>;
    getQuizzes(categoryName: string): Promise<Quiz[]>;
}
