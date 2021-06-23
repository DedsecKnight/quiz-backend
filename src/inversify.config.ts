import { Container } from "inversify";
import { TYPES } from "./types/types";

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

const container = new Container();
container.bind<IAnswerRepo>(TYPES.IAnswerRepo).to(AnswerRepo);
container.bind<ICategoryRepo>(TYPES.ICategoryRepo).to(CategoryRepo);
container.bind<IDifficultyRepo>(TYPES.IDifficultyRepo).to(DifficultyRepo);
container.bind<IQuestionRepo>(TYPES.IQuestionRepo).to(QuestionRepo);
container.bind<IQuizRepo>(TYPES.IQuizRepo).to(QuizRepo);
container.bind<ISubmissionRepo>(TYPES.ISubmissionRepo).to(SubmissionRepo);
container.bind<IUserRepo>(TYPES.IUserRepo).to(UserRepo);

export { container };
