import { Question } from "../entity/Question";

export interface IQuestionRepo {
    // Initialize a Question object
    // question: Content of question to be added
    // quizId: the quiz to which the question belongs
    initializeObj: (question: string, quizId: number) => Promise<Question>;

    // Get all questions in the databasse (regardless of quiz)
    findAll: () => Promise<Question[]>;

    // Get all questions of a quiz
    findByQuizId: (id: number) => Promise<Question[]>;
}
