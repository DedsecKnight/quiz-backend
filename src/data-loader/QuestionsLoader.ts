import * as DataLoader from "dataloader";
import { Question } from "../entity/Question";
import { Quiz } from "../entity/Quiz";

const questionsBatch = async (keys: number[]): Promise<Question[][]> => {
    const quizzes = await Quiz.createQueryBuilder("quiz")
        .leftJoinAndSelect("quiz.questions", "question")
        .where("quiz.id in (:...keys)", { keys })
        .getMany();
    return quizzes.map((quiz) => quiz.questions);
};

export const QuestionsLoader = () =>
    new DataLoader<number, Question[]>(questionsBatch);
