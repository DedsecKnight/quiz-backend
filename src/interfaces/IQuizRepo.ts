import { Quiz } from "../entity/Quiz";
import { CountData } from "./ICountData";

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
    // Create a new Quiz
    createQuiz: (quizArg: IQuizArgs) => Promise<Quiz>;

    // Get all quizzes
    // searchQuery: if blank, then fetch all quizzes, else fetch only those that matches searchQuery
    findAll: (searchQuery: string) => Promise<Quiz[]>;

    // Initialize a new Quiz object
    initializeObj: (
        quizName: string,
        authorId: number,
        difficultyId: number,
        categoryId: number
    ) => Promise<Quiz>;

    // Find a quiz with given ID
    findById: (id: number) => Promise<Quiz>;

    // Find a list of quizzes with given list of ID
    findByIds: (ids: number[]) => Promise<Quiz[]>;

    // Find a list of quizzes with eager loading of questions
    // with given list of ID
    findByIdsWithQuestions: (ids: number[]) => Promise<Quiz[]>;

    // Find all quizzes that is written by given User
    findByAuthor: (authorId: number) => Promise<Quiz[]>;

    // Find a quiz with a given name
    findByName: (name: string) => Promise<Quiz>;

    // Find all quizzes by difficulty
    findByDifficulty: (difficultyId: number) => Promise<Quiz[]>;

    // Find all quizzes by category
    findByCategory: (categoryId: number) => Promise<Quiz[]>;

    // Find quizzes (pagination)
    // offset: number of submissions to skip
    // limit: number of submissions to get
    // searchQuery: if empty, then get all returned quiz, else only quizzes with searchQuery will be fetched
    findWithOffsetAndLimit: (
        offset: number,
        limit: number,
        searchQuery: string
    ) => Promise<Quiz[]>;

    // Get count of number of quizzes written by a given user
    getUserQuizCount: (userId: number) => Promise<CountData>;

    // Get count of all quizzes
    getAllQuizCount: (searchQuery: string) => Promise<CountData>;

    // Check if a list of answers belong to a certain quiz
    // answerIds: list of ID of answer objects
    // quizId: ID of quiz
    checkIfAnswersBelongToQuiz: (
        answerIds: number[],
        quizId: string
    ) => Promise<boolean>;
}
