import * as DataLoader from "dataloader";
import { Category } from "../entity/Category";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.config";

const categoryBatch = async (keys: number[]): Promise<Category[]> => {
    const categoryRepo = container.get<ICategoryRepo>(TYPES.ICategoryRepo);
    const categories = await categoryRepo.findByIds(keys);

    const catMap: {
        [key: number]: Category;
    } = {};
    categories.forEach((catObj) => {
        catMap[catObj.id] = catObj;
    });

    return keys.map((key) => catMap[key]);
};

export const CategoryLoader = () =>
    new DataLoader<number, Category>(categoryBatch);
