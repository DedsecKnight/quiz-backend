import { Answer } from "../entity/Answer";

export interface IAnswerRepo {
    // Initialize a new Answer object
    initializeObj: (
        answer: string,
        isCorrect: boolean,
        questionId: number
    ) => Promise<Answer>;

    // Map a list of AnswerIds to a list of QuizIds of quizzes to which the answer belongs
    mapAnswerToQuiz: (answerIds: number[]) => Promise<number[]>;

    // Bulk insert a list of answer objects
    initializeObjs: (
        answers: Array<{ answer: string; isCorrect: boolean }>,
        questionId: number
    ) => Promise<number[]>;
}
