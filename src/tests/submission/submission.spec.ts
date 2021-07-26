import { ApolloServer, gql } from "apollo-server";
import { buildSchema } from "type-graphql";
import { Connection } from "typeorm";
import { IDifficultyRepo } from "../../interfaces/IDifficultyRepo";
import { container } from "../../inversify.config";
import { TYPES } from "../../inversify.types";
import { generateRefreshToken, generateToken } from "../../jwt/jwt";
import { QuestionResolver } from "../../resolvers/question/question.resolver";
import { QuizResolver } from "../../resolvers/quiz/quiz.resolver";
import { SubmissionResolver } from "../../resolvers/submission/submission.resolver";
import { UserResolver } from "../../resolvers/user/user.resolver";
import { ServerContext } from "../../server.config";
import {
    createMockUser,
    createMockQuiz,
    createMockSubmission,
} from "../mock/CreateMockObj";
import { createMockConnection } from "../mock/MockConnection";

let server: ApolloServer;
let connection: Connection;

beforeAll(async () => {
    connection = await createMockConnection();

    const schema = await buildSchema({
        resolvers: [
            QuizResolver,
            UserResolver,
            QuestionResolver,
            SubmissionResolver,
        ],
    });

    await createMockUser();

    let token = generateToken({
        id: 1,
    });
    let refreshtoken = generateRefreshToken({
        id: 1,
    });

    server = new ApolloServer({
        schema,
        context: ({ req }) =>
            ServerContext({
                ...req,
                headers: {
                    authorization: `Bearer ${token}`,
                    refreshtoken,
                },
            }),
    });

    await container.get<IDifficultyRepo>(TYPES.IDifficultyRepo).initialize();
    await createMockQuiz(server);
});

describe("Submission Mutation", () => {
    test("User makes a submission", async () => {
        const data = await createMockSubmission(server, [3]);
        const { submit } = data.data;
        expect(submit.score).toBe(100);
    });
});

describe("Submission Queries", () => {
    test("Fetch submission by id", async () => {
        const data = await server.executeOperation({
            query: gql`
                query SubmissionById($id: Float!) {
                    submissionById(id: $id) {
                        score
                        answers {
                            answer
                            isCorrect
                        }
                        quiz {
                            quizName
                        }
                    }
                }
            `,
            variables: {
                id: 1,
            },
        });

        const { submissionById } = data.data;
        expect(submissionById).toEqual({
            score: 100,
            answers: [
                {
                    answer: "Answer 3",
                    isCorrect: true,
                },
            ],
            quiz: {
                quizName: "New Quiz",
            },
        });
    });
});

describe("User-related Submission Queries", () => {
    test("Count submissions made by current user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query CountMySubmission {
                    countMySubmissions {
                        count
                    }
                }
            `,
        });
        const { countMySubmissions } = data.data;
        expect(countMySubmissions.count).toBe(1);
    });

    test("Get total score of current user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query GetUserScore {
                    myScore {
                        maxScore
                        totalScore
                    }
                }
            `,
        });
        const { myScore } = data.data;
        expect(myScore).toEqual({
            maxScore: 100,
            totalScore: 100,
        });
    });

    test("Get all submissions made by current user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query GetUserSubmissions {
                    mySubmissions {
                        score
                    }
                }
            `,
        });
        const { mySubmissions } = data.data;

        expect(mySubmissions.length).toBe(1);
        expect(mySubmissions[0]).toEqual({
            score: 100,
        });
    });

    test("Get most recent submissions made by current user", async () => {
        await createMockSubmission(server, [2]);
        const data = await server.executeOperation({
            query: gql`
                query UserRecentSubmission($limit: Float!) {
                    myRecentSubmissionsLimit(limit: $limit) {
                        score
                    }
                }
            `,
            variables: {
                limit: 1,
            },
        });
        const { myRecentSubmissionsLimit } = data.data;
        expect(myRecentSubmissionsLimit.length).toBe(1);
        expect(myRecentSubmissionsLimit[0].score).toBe(0);
    });
});

afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
});
