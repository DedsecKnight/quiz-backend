import * as DataLoader from "dataloader";
import { Quiz } from "../entity/Quiz";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { container } from "../inversify.config";
import { TYPES } from "../types/types";

const quizBatch = async (keys: number[]): Promise<Quiz[]> => {
    const quizRepo = container.get<IQuizRepo>(TYPES.IQuizRepo);

    const quizzes = await quizRepo.findByIds(keys);

    const quizMap: { [key: number]: Quiz } = {};
    quizzes.forEach((quiz) => {
        quizMap[quiz.id] = quiz;
    });

    return keys.map((key) => quizMap[key]);
};

export const QuizLoader = () => new DataLoader<number, Quiz>(quizBatch);
