import * as DataLoader from "dataloader";
import { Question } from "../entity/Question";
import { Quiz } from "../entity/Quiz";

const questionsBatch = async (keys: number[]): Promise<Question[][]> => {
    const quizzes = await Quiz.createQueryBuilder("quiz")
        .leftJoinAndSelect("quiz.questions", "question")
        .where("quiz.id in (:...keys)", { keys })
        .getMany();

    const quizMap: { [key: number]: Question[] } = {};
    quizzes.forEach((quiz) => {
        quizMap[quiz.id] = quiz.questions;
    });

    return keys.map((key) => quizMap[key]);
};

export const QuizQuestionsLoader = () =>
    new DataLoader<number, Question[]>(questionsBatch);
