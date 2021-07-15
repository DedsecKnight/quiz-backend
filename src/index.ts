import { buildSchema } from "type-graphql";

import "reflect-metadata";
import { createConnection } from "typeorm";

import { container } from "./inversify.config";
import { IDifficultyRepo } from "./interfaces/IDifficultyRepo";
import { TYPES } from "./inversify.config";

import { ApolloServer } from "apollo-server";
import { UserLoader } from "./data-loader/UserLoader";
import { TContext } from "./types/TContext";
import { DifficultyLoader } from "./data-loader/DifficultyLoader";
import { CategoryLoader } from "./data-loader/CategoryLoader";
import { QuizQuestionsLoader } from "./data-loader/QuizQuestionsLoader";
import { SubmissionAnswersLoader } from "./data-loader/SubmissionAnswersLoader";
import { QuizLoader } from "./data-loader/QuizLoader";
import { QuestionAnswersLoader } from "./data-loader/QuestionAnswersLoader";
import { SubmissionScoreLoader } from "./data-loader/SubmissionScoreLoader";

createConnection()
    .then(async () => {
        const schema = await buildSchema({
            resolvers: [__dirname + "/resolvers/**/*.{ts,js}"],
        });

        await container
            .get<IDifficultyRepo>(TYPES.IDifficultyRepo)
            .initialize();

        const server = new ApolloServer({
            schema,
            playground: true,
            context: ({ req }) =>
                ({
                    ...req,
                    userLoader: UserLoader(),
                    quizLoader: QuizLoader(),
                    difficultyLoader: DifficultyLoader(),
                    categoryLoader: CategoryLoader(),
                    quizQuestionsLoader: QuizQuestionsLoader(),
                    submissionAnswersLoader: SubmissionAnswersLoader(),
                    questionAnswersLoader: QuestionAnswersLoader(),
                    submissionScoreLoader: SubmissionScoreLoader(),
                } as TContext),
        });

        const { url } = await server.listen(5000);
        console.log(`Server is up at ${url}`);
    })
    .catch((err) => {
        console.log(err.message);
    });
