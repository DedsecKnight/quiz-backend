import * as DataLoader from "dataloader";
import { Answer } from "../entity/Answer";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";
import { container } from "../inversify.config";
import { TYPES } from "../types/types";

const answersBatch = async (keys: number[]): Promise<Answer[][]> => {
    const submissionRepo = container.get<ISubmissionRepo>(
        TYPES.ISubmissionRepo
    );
    const submissions = await submissionRepo.findByIdsWithAnswers(keys);
    const subMap: { [key: number]: Answer[] } = {};
    submissions.forEach((sub) => {
        subMap[sub.id] = sub.answers;
    });

    return keys.map((key) => subMap[key]);
};

export const SubmissionAnswersLoader = () =>
    new DataLoader<number, Answer[]>(answersBatch);
