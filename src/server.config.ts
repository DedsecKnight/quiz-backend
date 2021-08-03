import { CategoryLoader } from "./data-loader/CategoryLoader";
import { DifficultyLoader } from "./data-loader/DifficultyLoader";
import { QuestionAnswersLoader } from "./data-loader/QuestionAnswersLoader";
import { QuestionCorrectAnswerLoader } from "./data-loader/QuestionCorrectAnswer";
import { QuizLoader } from "./data-loader/QuizLoader";
import { QuizQuestionsLoader } from "./data-loader/QuizQuestionsLoader";
import { SubmissionAnswersLoader } from "./data-loader/SubmissionAnswersLoader";
import { SubmissionAuthorLoader } from "./data-loader/SubmissionAuthorLoader";
import { SubmissionScoreLoader } from "./data-loader/SubmissionScoreLoader";
import { UserLoader } from "./data-loader/UserLoader";
import { TContext } from "./types/TContext";

export const ServerContext = (req: any): TContext => ({
    ...req,
    userLoader: UserLoader(),
    quizLoader: QuizLoader(),
    difficultyLoader: DifficultyLoader(),
    categoryLoader: CategoryLoader(),
    quizQuestionsLoader: QuizQuestionsLoader(),
    submissionAnswersLoader: SubmissionAnswersLoader(),
    questionAnswersLoader: QuestionAnswersLoader(),
    submissionScoreLoader: SubmissionScoreLoader(),
    questionCorrectAnswerLoader: QuestionCorrectAnswerLoader(),
    submissionAuthorLoader: SubmissionAuthorLoader(),
});
