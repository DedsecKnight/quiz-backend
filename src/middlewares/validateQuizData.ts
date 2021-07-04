import { UserInputError } from "apollo-server";
import { MiddlewareFn } from "type-graphql";
import validator from "validator";
import { QuizArgs } from "../resolvers/quiz/types";

const emptyInput = (data: string) => !data || validator.isEmpty(data);

interface CreateQuizInputValidationErrorSchema {
    userId?: string;
    quizName?: string;
    questions?: string[];
    answers?: string[];
    category?: string;
    difficulty?: string;
}

const validDifficulty = (difficulty: string) =>
    difficulty == "Easy" || difficulty == "Hard" || difficulty == "Normal";

export const validateCreateQuizData: MiddlewareFn = ({ args }, next) => {
    if (!args.quiz)
        throw new UserInputError("Create quiz failed", {
            validationErrors: {
                error: "No data to create quiz",
            },
        });
    const { quiz } = <{ quiz: QuizArgs }>args;

    const validationErrors: CreateQuizInputValidationErrorSchema = {};

    if (emptyInput(quiz.quizName)) {
        validationErrors.quizName = "Quiz name is required";
    }

    if (emptyInput(quiz.category)) {
        validationErrors.category = "Quiz category is required";
    }

    if (emptyInput(quiz.difficulty)) {
        validationErrors.difficulty = "Quiz difficulty is required";
    } else if (!validDifficulty(quiz.difficulty)) {
        validationErrors.difficulty = "Invalid difficulty";
    }

    if (quiz.questions.length <= 0) {
        if (!validationErrors.questions) validationErrors.questions = [];
        validationErrors.questions = [
            ...validationErrors.questions,
            "A quiz must have at least 1 question",
        ];
    }

    quiz.questions.forEach(({ question, answers }, question_idx) => {
        if (emptyInput(question)) {
            if (!validationErrors.questions) validationErrors.questions = [];
            validationErrors.questions = [
                ...validationErrors.questions,
                `Description of question ${question_idx + 1} cannot be empty`,
            ];
        }

        if (answers.length != 4) {
            if (!validationErrors.answers) validationErrors.answers = [];
            validationErrors.answers = [
                ...validationErrors.answers,
                `Question ${question_idx + 1}: Must have 4 answers`,
            ];
        }

        answers.forEach(({ answer }, answer_idx) => {
            if (emptyInput(answer)) {
                if (!validationErrors.answers) validationErrors.answers = [];
                validationErrors.answers = [
                    ...validationErrors.answers,
                    `Question ${question_idx + 1}: Answer #${
                        answer_idx + 1
                    } must not be empty`,
                ];
            }
        });

        const correctAnswerCount = answers.filter(
            ({ isCorrect }) => isCorrect === true
        ).length;

        if (correctAnswerCount < 1) {
            if (!validationErrors.answers) validationErrors.answers = [];
            validationErrors.answers = [
                ...validationErrors.answers,
                `Question ${question_idx + 1}: 1 correct answer is required`,
            ];
        } else if (correctAnswerCount > 1) {
            if (!validationErrors.answers) validationErrors.answers = [];
            validationErrors.answers = [
                ...validationErrors.answers,
                `Question ${
                    question_idx + 1
                }: Only 1 correct answer is allowed`,
            ];
        }
    });

    if (Object.keys(validationErrors).length > 0) {
        throw new UserInputError(
            "Failed to create quiz due to validation errors",
            { validationErrors }
        );
    }

    return next();
};
