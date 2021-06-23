import { injectable } from "inversify";
import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { Quiz } from "../../entity/Quiz";
import { IQuizRepo } from "../../interfaces/IQuizRepo";
import { TYPES } from "../../types/types";
import { QuizArgs } from "./types";

import getDecorators from "inversify-inject-decorators";
import { container } from "../../inversify.config";
import { IDifficultyRepo } from "../../interfaces/IDifficultyRepo";
import { ICategoryRepo } from "../../interfaces/ICategoryRepo";
const { lazyInject } = getDecorators(container);

@Resolver(Quiz)
@injectable()
export class QuizResolver {
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;
    @lazyInject(TYPES.IDifficultyRepo) private _difficultyRepo: IDifficultyRepo;
    @lazyInject(TYPES.ICategoryRepo) private _categoryRepo: ICategoryRepo;

    @Mutation(() => Quiz)
    async createQuiz(
        @Arg("quiz")
        quizArg: QuizArgs
    ): Promise<Quiz> {
        try {
            const newQuiz = this._quizRepo.createQuiz(quizArg);
            return newQuiz;
        } catch (error) {
            console.log(error.message);
        }
    }

    @Query(() => [Quiz])
    async quizByDifficulty(
        @Arg("difficulty") difficulty: string
    ): Promise<Quiz[]> {
        try {
            const quizzes = await this._difficultyRepo.getQuizzes(difficulty);
            return quizzes;
        } catch (error) {
            console.log(error);
        }
    }

    @Query(() => [Quiz])
    async quizByCategories(@Arg("category") category: string): Promise<Quiz[]> {
        try {
            const quizzes = await this._categoryRepo.getQuizzes(category);
            return quizzes;
        } catch (error) {
            console.log(error);
        }
    }

    @Query(() => Quiz)
    async quizById(@Arg("id") id: number): Promise<Quiz | null> {
        try {
            const quiz = await this._quizRepo.findById(id);
            if (!quiz) throw new Error("Quiz does not exists");
            return quiz;
        } catch (error) {
            if (error.message.indexOf("Quiz does not exists") !== -1)
                throw error;
            else console.log(error);
        }
    }

    @Query(() => [Quiz])
    async quizzes(): Promise<Quiz[]> {
        try {
            const quizzes = await this._quizRepo.findAll();
            return quizzes;
        } catch (error) {
            console.log(error);
        }
    }

    @Query(() => [Quiz])
    async quizzesByUser(@Arg("userId") id: number): Promise<Quiz[]> {
        try {
            const quizzes = await this._quizRepo.findByAuthor(id);
            return quizzes;
        } catch (error) {
            console.log(error);
        }
    }
}
