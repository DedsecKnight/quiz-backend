import { Request } from "express";
import { IncomingHttpHeaders } from "http2";
import { CategoryLoader } from "../data-loader/CategoryLoader";
import { DifficultyLoader } from "../data-loader/DifficultyLoader";
import { QuestionsLoader } from "../data-loader/QuestionsLoader";
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
    difficultyLoader: ReturnType<typeof DifficultyLoader>;
    categoryLoader: ReturnType<typeof CategoryLoader>;
    questionsLoader: ReturnType<typeof QuestionsLoader>;
}
