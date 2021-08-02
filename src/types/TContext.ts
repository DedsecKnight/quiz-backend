import { Request } from "express";
import { IncomingHttpHeaders } from "http2";
import { CategoryLoader } from "../data-loader/CategoryLoader";
import { DifficultyLoader } from "../data-loader/DifficultyLoader";
import { QuestionAnswersLoader } from "../data-loader/QuestionAnswersLoader";
import { QuestionCorrectAnswerLoader } from "../data-loader/QuestionCorrectAnswer";
import { QuizLoader } from "../data-loader/QuizLoader";
import { QuizQuestionsLoader } from "../data-loader/QuizQuestionsLoader";
import { SubmissionAnswersLoader } from "../data-loader/SubmissionAnswersLoader";
import { SubmissionScoreLoader } from "../data-loader/SubmissionScoreLoader";
import { UserLoader } from "../data-loader/UserLoader";

export interface MyHeader extends IncomingHttpHeaders {
    authorization: string;
    refreshtoken: string;
}

export interface UserData {
    id: number;
}

export interface TContext extends Request {
    user: UserData;
    headers: MyHeader;
    userLoader: ReturnType<typeof UserLoader>;
    questionAnswersLoader: ReturnType<typeof QuestionAnswersLoader>;
    quizLoader: ReturnType<typeof QuizLoader>;
    difficultyLoader: ReturnType<typeof DifficultyLoader>;
    categoryLoader: ReturnType<typeof CategoryLoader>;
    quizQuestionsLoader: ReturnType<typeof QuizQuestionsLoader>;
    submissionAnswersLoader: ReturnType<typeof SubmissionAnswersLoader>;
    submissionScoreLoader: ReturnType<typeof SubmissionScoreLoader>;
    questionCorrectAnswerLoader: ReturnType<typeof QuestionCorrectAnswerLoader>;
}
