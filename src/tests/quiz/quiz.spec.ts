import { ApolloServer, gql } from "apollo-server";
import { buildSchema } from "type-graphql";
import { Connection } from "typeorm";
import { createMockConnection } from "../mock/MockConnection";
import { QuizResolver } from "../../resolvers/quiz/quiz.resolver";
import { UserResolver } from "../../resolvers/user/user.resolver";
import { ServerContext } from "../../server.config";
import { createMockUser, createMockQuiz } from "../mock/CreateMockObj";
import { generateRefreshToken, generateToken } from "../../jwt/jwt";
import { container } from "../../inversify.config";
import { IDifficultyRepo } from "../../interfaces/IDifficultyRepo";
import { TYPES } from "../../inversify.types";
import { QuestionResolver } from "../../resolvers/question/question.resolver";

let server: ApolloServer;
let connection: Connection;

beforeAll(async () => {
    connection = await createMockConnection();

    const schema = await buildSchema({
        resolvers: [QuizResolver, UserResolver, QuestionResolver],
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
});

describe("Quiz Mutation", () => {
    test("Dummy user creates quiz", async () => {
        const data = await createMockQuiz(server);
        expect(data.data.createQuiz.quizName).toBe("New Quiz");
    });

    test("Create Quiz Validation", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation CreateQuiz($quizArg: QuizArgs!) {
                    createQuiz(quiz: $quizArg) {
                        quizName
                    }
                }
            `,
            variables: {
                quizArg: {
                    quizName: "",
                    category: "",
                    difficulty: "",
                    questions: [
                        {
                            question: "",
                            answers: [
                                {
                                    answer: "",
                                    isCorrect: false,
                                },
                                {
                                    answer: "",
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
                        {
                            question: "Q2",
                            answers: [
                                {
                                    answer: "Answer 1",
                                    isCorrect: false,
                                },
                                {
                                    answer: "Answer 2",
                                    isCorrect: true,
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
                        {
                            question: "Q3",
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
                            ],
                        },
                        {
                            question: "Q4",
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
                                    isCorrect: false,
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

        expect(data.data).toBe(null);
        expect(data.errors[0].extensions.validationErrors).toEqual({
            quizName: "Quiz name is required",
            category: "Quiz category is required",
            difficulty: "Quiz difficulty is required",
            questions: ["Description of question 1 cannot be empty"],
            answers: [
                "Question 1: Answer #1 must not be empty",
                "Question 1: Answer #2 must not be empty",
                "Question 2: Only 1 correct answer is allowed",
                "Question 3: Must have 4 answers",
                "Question 4: 1 correct answer is required",
            ],
        });
    });

    test("Invalid difficulty", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation CreateQuiz($quizArg: QuizArgs!) {
                    createQuiz(quiz: $quizArg) {
                        quizName
                    }
                }
            `,
            variables: {
                quizArg: {
                    quizName: "Test",
                    category: "Test",
                    difficulty: "Very easy",
                    questions: [
                        {
                            question: "Test",
                            answers: [
                                {
                                    answer: "Test",
                                    isCorrect: false,
                                },
                                {
                                    answer: "Test",
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
                        {
                            question: "Q2",
                            answers: [
                                {
                                    answer: "Answer 1",
                                    isCorrect: false,
                                },
                                {
                                    answer: "Answer 2",
                                    isCorrect: true,
                                },
                                {
                                    answer: "Answer 3",
                                    isCorrect: false,
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

        expect(data.data).toBe(null);
        expect(data.errors[0].extensions.validationErrors).toEqual({
            difficulty: "Invalid difficulty",
        });
    });

    test("Quiz with no question", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation CreateQuiz($quizArg: QuizArgs!) {
                    createQuiz(quiz: $quizArg) {
                        quizName
                    }
                }
            `,
            variables: {
                quizArg: {
                    quizName: "Test",
                    category: "Test",
                    difficulty: "Easy",
                    questions: [],
                },
            },
        });

        expect(data.data).toBe(null);
        expect(data.errors[0].extensions.validationErrors).toEqual({
            questions: ["A quiz must have at least 1 question"],
        });
    });
});

describe("Quiz Queries", () => {
    test("Get quizzes authored by dummy user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizByUser {
                    myQuizzes {
                        quizName
                        author {
                            name
                        }
                        difficulty {
                            type
                        }
                        category {
                            categoryName
                        }
                        questions {
                            question
                            answers {
                                answer
                                isCorrect
                            }
                        }
                    }
                }
            `,
        });

        expect(data.errors).toBe(undefined);

        const { myQuizzes } = data.data;
        expect(myQuizzes.length).toBe(1);

        expect(myQuizzes[0].quizName).toBe("New Quiz");

        expect(myQuizzes[0].author.name).toBe("Test123");
        expect(myQuizzes[0].difficulty.type).toBe("Easy");
        expect(myQuizzes[0].category.categoryName).toBe("Test");

        expect(myQuizzes[0].questions.length).toBe(1);
        expect(myQuizzes[0].questions[0].question).toBe("Test Question");
        expect(myQuizzes[0].questions[0].answers.length).toBe(4);
        myQuizzes[0].questions[0].answers.forEach((obj: any, idx: number) => {
            expect(obj.answer).toBe(`Answer ${idx + 1}`);
            expect(obj.isCorrect).toBe(idx == 2);
        });
    });

    test("Get all quiz count", async () => {
        const data = await server.executeOperation({
            query: gql`
                query GetQuizCount {
                    countQuizzes {
                        count
                    }
                }
            `,
        });
        const { countQuizzes } = data.data;
        expect(countQuizzes).toEqual({
            count: 1,
        });
    });

    test("Fetch correct answer of questions in a quiz", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizByUser {
                    quizzes {
                        questions {
                            correctAnswer {
                                answer
                                isCorrect
                            }
                        }
                    }
                }
            `,
        });

        const { quizzes } = data.data;
        expect(quizzes.length).toBe(1);
        quizzes[0].questions.forEach((question: any) => {
            expect(question.correctAnswer.isCorrect).toBe(true);
        });
    });

    test("Fetch quizzes by author", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizzesByAuthor($userId: Float!) {
                    quizzesByAuthor(userId: $userId) {
                        quizName
                    }
                }
            `,
            variables: {
                userId: 1,
            },
        });
        const { quizzesByAuthor } = data.data;
        expect(quizzesByAuthor.length).toBe(1);
        expect(quizzesByAuthor[0].quizName).toBe("New Quiz");
    });

    test("Fetch quiz by name", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizByName($name: String!) {
                    quizzes(query: $name) {
                        quizName
                        author {
                            name
                        }
                    }
                }
            `,
            variables: {
                name: "New Quiz",
            },
        });
        const { quizzes } = data.data;
        expect(quizzes.length).toBe(1);
        expect(quizzes[0].quizName).toBe("New Quiz");
        expect(quizzes[0].author.name).toBe("Test123");
    });

    test("Fetch quiz by ID", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizById($Id: Float!) {
                    quizById(id: $Id) {
                        id
                        quizName
                        author {
                            name
                        }
                    }
                }
            `,
            variables: {
                Id: 1,
            },
        });
        const { quizById } = data.data;
        expect(parseInt(quizById.id)).toBe(1);
        expect(quizById.quizName).toBe("New Quiz");
        expect(quizById.author.name).toBe("Test123");
    });

    test("Fetch quizzes by difficulty", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizzesByDifficulty($difficulty: String!) {
                    quizzesByDifficulty(difficulty: $difficulty) {
                        quizName
                        difficulty {
                            type
                        }
                    }
                }
            `,
            variables: {
                difficulty: "Easy",
            },
        });
        const { quizzesByDifficulty } = data.data;
        expect(quizzesByDifficulty.length).toBe(1);
        expect(quizzesByDifficulty[0].quizName).toBe("New Quiz");
        expect(quizzesByDifficulty[0].difficulty.type).toBe("Easy");
    });

    test("Fetch quizzes by category", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizzesByCategory($category: String!) {
                    quizzesByCategory(category: $category) {
                        quizName
                        category {
                            categoryName
                        }
                    }
                }
            `,
            variables: {
                category: "Test",
            },
        });
        const { quizzesByCategory } = data.data;
        expect(quizzesByCategory.length).toBe(1);
        expect(quizzesByCategory[0].quizName).toBe("New Quiz");
        expect(quizzesByCategory[0].category.categoryName).toBe("Test");
    });
});

describe("User-related Quiz Queries", () => {
    test("Get count of quizzes made by current user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizzesByUser {
                    countMyQuizzes {
                        count
                    }
                }
            `,
        });
        const { countMyQuizzes } = data.data;
        expect(countMyQuizzes.count).toBe(1);
    });

    test("Get all quizzes authored by current user", async () => {
        const data = await server.executeOperation({
            query: gql`
                query QuizzesByUser {
                    myQuizzes {
                        quizName
                    }
                }
            `,
        });
        const { myQuizzes } = data.data;
        expect(myQuizzes.length).toBe(1);
        expect(myQuizzes[0].quizName).toBe("New Quiz");
    });
});

afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
});
