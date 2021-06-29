import { Quiz } from "../entity/Quiz";

export interface IAnswerArgs {
    answer: string;
    isCorrect: boolean;
}

export interface IQuestionArgs {
    question: string;
    answers: IAnswerArgs[];
}

export interface IQuizArgs {
    userId: number;
    quizName: string;
    questions: IQuestionArgs[];
    difficulty: string;
    category: string;
}

export interface IQuizRepo {
    createQuiz: (quizArg: IQuizArgs) => Promise<Quiz>;
    findAll: () => Promise<Quiz[]>;
    initializeObj: (
        quizName: string,
        authorId: number,
        difficultyId: number,
        categoryId: number
    ) => Promise<Quiz>;
    findById: (id: number) => Promise<Quiz>;
    findByAuthor: (authorId: number) => Promise<Quiz[]>;
    findByName: (name: string) => Promise<Quiz>;
    findWithOffsetAndLimit: (offset: number, limit: number) => Promise<Quiz[]>;
}
