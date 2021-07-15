import * as DataLoader from "dataloader";
import { Answer } from "../entity/Answer";
import { IQuestionRepo } from "../interfaces/IQuestionRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.types";

const answersBatch = async (keys: number[]): Promise<Answer[][]> => {
    const questionRepo = container.get<IQuestionRepo>(TYPES.IQuestionRepo);
    const questions = await questionRepo.findByIdsWithAnswers(keys);

    const questionMap: { [key: number]: Answer[] } = {};

    questions.map((question) => {
        questionMap[question.id] = question.answers;
    });

    return keys.map((key) => questionMap[key]);
};

export const QuestionAnswersLoader = () =>
    new DataLoader<number, Answer[]>(answersBatch);
