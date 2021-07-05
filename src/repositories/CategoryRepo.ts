import { injectable } from "inversify";
import { Category } from "../entity/Category";
import { Quiz } from "../entity/Quiz";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { container } from "../inversify.config";
import { TYPES } from "../types/types";

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
        const catObj = await this.findByCategoryName(categoryName);
        const quizzes = await container
            .get<IQuizRepo>(TYPES.IQuizRepo)
            .findByCategory(catObj.id);
        return quizzes;
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
