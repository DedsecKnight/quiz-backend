import { injectable } from "inversify";
import { Arg, Mutation, Resolver, Query, UseMiddleware } from "type-graphql";
import { Quiz } from "../../entity/Quiz";
import { IQuizRepo } from "../../interfaces/IQuizRepo";
import { TYPES } from "../../types/types";
import { QuizArgs } from "./types";

import getDecorators from "inversify-inject-decorators";
import { container } from "../../inversify.config";
import { IDifficultyRepo } from "../../interfaces/IDifficultyRepo";
import { ICategoryRepo } from "../../interfaces/ICategoryRepo";
import { ResourceNotFound } from "../../errors/ResourceNotFound";
import { CountData } from "../../interfaces/ICountData";
import { validateCreateQuizData } from "../../middlewares/validateQuizData";
import { AuthenticationError } from "apollo-server";
const { lazyInject } = getDecorators(container);

@Resolver(Quiz)
@injectable()
export class QuizResolver {
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;
    @lazyInject(TYPES.IDifficultyRepo) private _difficultyRepo: IDifficultyRepo;
    @lazyInject(TYPES.ICategoryRepo) private _categoryRepo: ICategoryRepo;

    @Mutation(() => Quiz)
    @UseMiddleware(validateCreateQuizData)
    async createQuiz(
        @Arg("quiz")
        quizArg: QuizArgs
    ): Promise<Quiz> {
        try {
            const newQuiz = this._quizRepo.createQuiz(quizArg);
            return newQuiz;
        } catch (error) {
            if (error instanceof AuthenticationError) throw error;
            console.log(error);
            throw new Error("Database Error");
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
            throw new Error("Database Error");
        }
    }

    @Query(() => [Quiz])
    async quizByCategories(@Arg("category") category: string): Promise<Quiz[]> {
        try {
            const quizzes = await this._categoryRepo.getQuizzes(category);
            return quizzes;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => Quiz)
    async quizById(@Arg("id") id: number): Promise<Quiz | null> {
        try {
            const quiz = await this._quizRepo.findById(id);
            if (!quiz) throw new ResourceNotFound("Quiz does not exist");
            return quiz;
        } catch (error) {
            if (error instanceof ResourceNotFound) throw error;
            else {
                console.log(error);
                throw new Error("Database Error");
            }
        }
    }

    @Query(() => Quiz)
    async quizByName(@Arg("name") name: string): Promise<Quiz> {
        try {
            const quiz = await this._quizRepo.findByName(name);
            if (!quiz) throw new ResourceNotFound("Quiz does not exist");
            return quiz;
        } catch (error) {
            if (error instanceof ResourceNotFound) throw error;
            else {
                console.log(error);
                throw new Error("Database Error");
            }
        }
    }

    @Query(() => [Quiz])
    async quizzes(): Promise<Quiz[]> {
        try {
            const quizzes = await this._quizRepo.findAll();
            return quizzes;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => [Quiz])
    async quizzesByAuthor(@Arg("userId") id: number): Promise<Quiz[]> {
        try {
            const quizzes = await this._quizRepo.findByAuthor(id);
            return quizzes;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => [Quiz])
    async quizzesLimit(
        @Arg("offset") offset: number,
        @Arg("limit") limit: number
    ): Promise<Quiz[]> {
        try {
            const quizzes = await this._quizRepo.findWithOffsetAndLimit(
                offset,
                limit
            );
            return quizzes;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => CountData)
    async countAllQuizzes(): Promise<CountData> {
        try {
            const data = await this._quizRepo.getAllQuizCount();
            return data;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }
}
