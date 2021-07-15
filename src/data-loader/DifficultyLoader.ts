import * as DataLoader from "dataloader";
import { Difficulty } from "../entity/Difficulty";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.types";

const difficultyBatch = async (keys: number[]): Promise<Difficulty[]> => {
    const difficultyRepo = container.get<IDifficultyRepo>(
        TYPES.IDifficultyRepo
    );

    const difficulties = await difficultyRepo.findByIds(keys);

    const diffMap: {
        [key: number]: Difficulty;
    } = {};

    difficulties.forEach((diffObj) => {
        diffMap[diffObj.id] = diffObj;
    });

    return keys.map((key) => diffMap[key]);
};

export const DifficultyLoader = () =>
    new DataLoader<number, Difficulty>(difficultyBatch);
