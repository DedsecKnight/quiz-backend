import { injectable } from "inversify";
import { Category } from "../entity/Category";
import { Quiz } from "../entity/Quiz";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";

@injectable()
export class CategoryRepo implements ICategoryRepo {
    async findOrCreate(categoryName: string): Promise<Category> {
        let catObj = await Category.findOne({
            categoryName,
        });
        if (!catObj) catObj = await Category.create({ categoryName }).save();
        return catObj;
    }

    async getQuizzes(categoryName: string): Promise<Quiz[]> {
        const catObj = await Category.findOne({
            relations: [
                "quizzes",
                "quizzes.questions",
                "quizzes.questions.answers",
                "quizzes.difficulty",
                "quizzes.category",
            ],
            where: { categoryName },
        });
        if (!catObj) return [];
        return catObj.quizzes;
    }

    async findById(id: number): Promise<Category> {
        return Category.findOne(id);
    }

    async findByIds(ids: number[]): Promise<Category[]> {
        return Category.findByIds(ids);
    }

    async findByCategoryName(categoryName: string): Promise<Category> {
        return Category.findOne({
            where: {
                categoryName,
            },
        });
    }
}
