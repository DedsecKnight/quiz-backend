import { ApolloServer, gql } from "apollo-server";
import * as bcrypt from "bcrypt";
import { IUserRepo } from "../../interfaces/IUserRepo";
import { container } from "../../inversify.config";
import { TYPES } from "../../inversify.types";

export const createDummyUser = async () => {
    const userRepo = container.get<IUserRepo>(TYPES.IUserRepo);
    const hashedPassword = await bcrypt.hash("test1234", 10).catch((err) => {
        console.log("Hashing error");
        throw new Error("Database Error");
    });
    await userRepo.initializeObj("Test123", "test@test.com", hashedPassword);
};

export const createMockQuiz = (server: ApolloServer) => {
    return server.executeOperation({
        query: gql`
            mutation CreateQuiz($quizArg: QuizArgs!) {
                createQuiz(quiz: $quizArg) {
                    quizName
                }
            }
        `,
        variables: {
            quizArg: {
                quizName: "New Quiz",
                category: "Test",
                difficulty: "Easy",
                questions: [
                    {
                        question: "Test Question",
                        answers: [
                            {
                                answer: "Answer 1",
                                isCorrect: false,
                            },
                            {
                                answer: "Answer 2",
                                isCorrect: false,
                            },
                            {
                                answer: "Answer 3",
                                isCorrect: true,
                            },
                            {
                                answer: "Answer 4",
                                isCorrect: false,
                            },
                        ],
                    },
                ],
            },
        },
    });
};

export const createMockSubmission = (
    server: ApolloServer,
    answers: number[]
) => {
    return server.executeOperation({
        query: gql`
            mutation SubmitQuiz($submitInput: SubmitInput!) {
                submit(submitInput: $submitInput) {
                    score
                }
            }
        `,
        variables: {
            submitInput: {
                quizId: 1,
                answers,
            },
        },
    });
};
