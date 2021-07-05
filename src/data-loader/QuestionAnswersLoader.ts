import * as DataLoader from "dataloader";
import { Answer } from "../entity/Answer";
import { Question } from "../entity/Question";

const answersBatch = async (keys: number[]): Promise<Answer[][]> => {
    const questions = await Question.createQueryBuilder("question")
        .leftJoinAndSelect("question.answers", "answer")
        .where("question.id in (:...keys)", { keys })
        .getMany();
    const questionMap: { [key: number]: Answer[] } = {};

    questions.map((question) => {
        questionMap[question.id] = question.answers;
    });

    return keys.map((key) => questionMap[key]);
};

export const QuestionAnswersLoader = () =>
    new DataLoader<number, Answer[]>(answersBatch);
