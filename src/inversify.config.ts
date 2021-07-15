import { Container } from "inversify";

import { IAnswerRepo } from "./interfaces/IAnswerRepo";
import { ICategoryRepo } from "./interfaces/ICategoryRepo";
import { IDifficultyRepo } from "./interfaces/IDifficultyRepo";
import { IQuestionRepo } from "./interfaces/IQuestionRepo";
import { IQuizRepo } from "./interfaces/IQuizRepo";
import { ISubmissionRepo } from "./interfaces/ISubmissionRepo";
import { IUserRepo } from "./interfaces/IUserRepo";

import { AnswerRepo } from "./repositories/AnswerRepo";
import { CategoryRepo } from "./repositories/CategoryRepo";
import { DifficultyRepo } from "./repositories/DifficultyRepo";
import { QuestionRepo } from "./repositories/QuestionRepo";
import { QuizRepo } from "./repositories/QuizRepo";
import { SubmissionRepo } from "./repositories/SubmissionRepo";
import { UserRepo } from "./repositories/UserRepo";

export const TYPES = {
    IDifficultyRepo: Symbol.for("IDifficultyRepo"),
    ICategoryRepo: Symbol.for("ICategoryRepo"),
    IQuestionRepo: Symbol.for("IQuestionRepo"),
    IAnswerRepo: Symbol.for("IAnswerRepo"),
    IUserRepo: Symbol.for("IUserRepo"),
    IQuizRepo: Symbol.for("IQuizRepo"),
    ISubmissionRepo: Symbol.for("ISubmissionRepo"),
};

const container = new Container();
container.bind<IAnswerRepo>(TYPES.IAnswerRepo).to(AnswerRepo);
container.bind<ICategoryRepo>(TYPES.ICategoryRepo).to(CategoryRepo);
container.bind<IDifficultyRepo>(TYPES.IDifficultyRepo).to(DifficultyRepo);
container.bind<IQuestionRepo>(TYPES.IQuestionRepo).to(QuestionRepo);
container.bind<IQuizRepo>(TYPES.IQuizRepo).to(QuizRepo);
container.bind<ISubmissionRepo>(TYPES.ISubmissionRepo).to(SubmissionRepo);
container.bind<IUserRepo>(TYPES.IUserRepo).to(UserRepo);

export { container };
