import * as DataLoader from "dataloader";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.types";

const scoreBatch = async (keys: number[]): Promise<number[]> => {
    const submissionRepo = container.get<ISubmissionRepo>(
        TYPES.ISubmissionRepo
    );
    const datas = await submissionRepo.getScores(keys);

    const scoreMap: { [key: number]: number } = {};
    datas.forEach((data) => {
        scoreMap[data.id] = data.score;
    });

    return keys.map((key) => scoreMap[key]);
};

export const SubmissionScoreLoader = () =>
    new DataLoader<number, number>(scoreBatch);
