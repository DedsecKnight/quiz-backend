import { Category } from "../entity/Category";
import { Quiz } from "../entity/Quiz";

export interface ICategoryRepo {
    // Find a Category object with categoryName, if object does not exist, then create a new object with categoryName
    findOrCreate(categoryName: string): Promise<Category>;

    // Get all quizzes with given category
    getQuizzes(categoryName: string): Promise<Quiz[]>;

    // Find Category object with given id
    findById(id: number): Promise<Category>;

    // Find Category objects with given id list
    findByIds(ids: number[]): Promise<Category[]>;

    // Find Category object with given category name
    findByCategoryName(categoryName: string): Promise<Category>;
}
