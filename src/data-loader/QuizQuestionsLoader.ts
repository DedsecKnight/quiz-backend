import * as DataLoader from "dataloader";
import { Question } from "../entity/Question";
import { IQuizRepo } from "../interfaces/IQuizRepo";
import { container } from "../inversify.config";
import { TYPES } from "../inversify.config";

const questionsBatch = async (keys: number[]): Promise<Question[][]> => {
    const quizRepo = container.get<IQuizRepo>(TYPES.IQuizRepo);
    const quizzes = await quizRepo.findByIdsWithQuestions(keys);

    const quizMap: { [key: number]: Question[] } = {};
    quizzes.forEach((quiz) => {
        quizMap[quiz.id] = quiz.questions;
    });

    return keys.map((key) => quizMap[key]);
};

export const QuizQuestionsLoader = () =>
    new DataLoader<number, Question[]>(questionsBatch);
