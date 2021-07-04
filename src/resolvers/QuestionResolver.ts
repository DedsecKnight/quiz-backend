import { injectable } from "inversify";
import { Query, Resolver } from "type-graphql";
import { Question } from "../entity/Question";

import getDecorators from "inversify-inject-decorators";
import { container } from "../inversify.config";
import { TYPES } from "../types/types";
import { IQuestionRepo } from "../interfaces/IQuestionRepo";
const { lazyInject } = getDecorators(container);

@injectable()
@Resolver()
export class QuestionResolver {
    @lazyInject(TYPES.IQuestionRepo) private _questionRepo: IQuestionRepo;
    @Query(() => [Question])
    async questions(): Promise<Question[]> {
        try {
            const questions = await this._questionRepo.findAll();
            return questions;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }
}
