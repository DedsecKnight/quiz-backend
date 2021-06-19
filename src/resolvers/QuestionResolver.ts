import { Query, Resolver } from "type-graphql";
import { Question } from "../entity/Question";

@Resolver()
export class QuestionResolver {
    @Query(() => [Question])
    async questions(): Promise<Question[]> {
        const questions = await Question.find({
            relations: ["answers"],
        });
        return questions;
    }
}
