import {
    Arg,
    Mutation,
    Resolver,
    Query,
    UseMiddleware,
    Ctx,
    FieldResolver,
    Root,
} from "type-graphql";
import { Quiz } from "../../entity/Quiz";
import { IQuizRepo } from "../../interfaces/IQuizRepo";
import { TYPES } from "../../inversify.types";
import { QuizArgs } from "./quiz.types";

import getDecorators from "inversify-inject-decorators";
import { container } from "../../inversify.config";
import { IDifficultyRepo } from "../../interfaces/IDifficultyRepo";
import { ICategoryRepo } from "../../interfaces/ICategoryRepo";
import { ResourceNotFound } from "../../errors/ResourceNotFound";
import { CountData } from "../../interfaces/ICountData";
import { validateCreateQuizData } from "../../middlewares/validateQuizData";
import { checkAuthorization } from "../../middlewares/auth";
import { TContext } from "../../types/TContext";
import { User } from "../../entity/User";
import { Difficulty } from "../../entity/Difficulty";
import { Category } from "../../entity/Category";
import { Question } from "../../entity/Question";
import { UserInputError } from "apollo-server";
const { lazyInject } = getDecorators(container);

@Resolver(Quiz)
export class QuizResolver {
    @lazyInject(TYPES.IQuizRepo) private _quizRepo: IQuizRepo;
    @lazyInject(TYPES.IDifficultyRepo) private _difficultyRepo: IDifficultyRepo;
    @lazyInject(TYPES.ICategoryRepo) private _categoryRepo: ICategoryRepo;

    @Mutation(() => Quiz)
    @UseMiddleware(checkAuthorization, validateCreateQuizData)
    async createQuiz(
        @Ctx() context: TContext,
        @Arg("quiz")
        quizArg: QuizArgs
    ): Promise<Quiz> {
        quizArg.userId = context.user.id;
        try {
            const newQuiz = this._quizRepo.createQuiz(quizArg);
            return newQuiz;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => [Quiz])
    async quizzesByDifficulty(
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
    async quizzesByCategory(
        @Arg("category") category: string
    ): Promise<Quiz[]> {
        try {
            const quizzes = await this._categoryRepo.getQuizzes(category);
            return quizzes;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @Query(() => Quiz)
    async quizById(@Arg("id") id: number): Promise<Quiz> {
        const quiz = await this._quizRepo.findById(id).catch((error) => {
            console.log(error);
            throw new Error("Database Error");
        });
        if (!quiz) throw new ResourceNotFound("Quiz does not exist");
        return quiz;
    }

    @Query(() => [Quiz])
    async quizzes(
        @Arg("query", { nullable: true }) searchQuery: string | undefined,
        @Arg("limit", { nullable: true }) limit: number | undefined,
        @Arg("offset", { nullable: true }) offset: number | undefined
    ): Promise<Quiz[]> {
        // If both limit and offset are undefined, then fetch all quizzes
        if (limit === undefined && offset === undefined) {
            const quizzes = await this._quizRepo
                .findAll(searchQuery || "")
                .catch((error) => {
                    console.log(error);
                    throw new Error("Database Error");
                });
            return quizzes;
        }

        // If either limit or offset are undefined, throw an Error
        if (limit === undefined || offset === undefined)
            throw new UserInputError("Fetch quizzes error", {
                validationErrors: {
                    message:
                        "Limit and offset has to be either both included or both null",
                },
            });

        // Fetch quizzes with offset and limit
        const quizzes = await this._quizRepo
            .findWithOffsetAndLimit(offset, limit, searchQuery || "")
            .catch((error) => {
                console.log(error);
                throw new Error("Database Error");
            });
        return quizzes;
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

    @Query(() => CountData)
    async countQuizzes(
        @Arg("query", { nullable: true }) searchQuery: string | undefined
    ): Promise<CountData> {
        try {
            const data = await this._quizRepo.getAllQuizCount(
                searchQuery || ""
            );
            return data;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => User)
    async author(@Ctx() context: TContext, @Root() quiz: Quiz) {
        try {
            const author = await context.userLoader.load(quiz.authorId);
            return author;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => Difficulty)
    async difficulty(@Ctx() context: TContext, @Root() quiz: Quiz) {
        try {
            const diffObj = await context.difficultyLoader.load(
                quiz.difficultyId
            );
            return diffObj;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => Category)
    async category(@Ctx() context: TContext, @Root() quiz: Quiz) {
        try {
            const category = await context.categoryLoader.load(quiz.categoryId);
            return category;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }

    @FieldResolver(() => [Question])
    async questions(
        @Ctx() context: TContext,
        @Root() quiz: Quiz
    ): Promise<Question[]> {
        try {
            const questions = await context.quizQuestionsLoader.load(quiz.id);
            return questions;
        } catch (error) {
            console.log(error);
            throw new Error("Database Error");
        }
    }
}
