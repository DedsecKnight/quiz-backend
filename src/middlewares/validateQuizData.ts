import { UserInputError } from "apollo-server";
import { MiddlewareFn } from "type-graphql";
import validator from "validator";
import { QuizArgs } from "../resolvers/quiz/types";

const emptyInput = (data: string) => !data || validator.isEmpty(data);

export const validateCreateQuizData: MiddlewareFn = ({ args }, next) => {
    if (!args.quiz) throw new UserInputError("No data to create quiz");
    const { quiz } = <{ quiz: QuizArgs }>args;

    if (emptyInput(quiz.quizName)) {
        throw new UserInputError("Quiz name is required");
    }

    if (emptyInput(quiz.category)) {
        throw new UserInputError("Quiz category is required");
    }

    if (emptyInput(quiz.difficulty)) {
        throw new UserInputError("Quiz difficulty is required");
    }

    if (quiz.questions.length <= 0) {
        throw new UserInputError("A quiz must have at least 1 question");
    }

    quiz.questions.forEach(({ question, answers }, question_idx) => {
        if (emptyInput(question)) {
            throw new UserInputError(
                `Description of question ${question_idx + 1} cannot be empty`
            );
        }

        if (answers.length != 4) {
            throw new UserInputError(
                `Question ${question_idx + 1}: Must have 4 answers`
            );
        }

        answers.forEach(({ answer }, answer_idx) => {
            if (emptyInput(answer)) {
                throw new UserInputError(
                    `Question ${question_idx + 1}: Answer #${
                        answer_idx + 1
                    } must not be empty`
                );
            }
        });

        const correctAnswerCount = answers.filter(
            ({ isCorrect }) => isCorrect === true
        ).length;

        if (correctAnswerCount < 1) {
            throw new UserInputError(
                `Question ${question_idx + 1}: 1 correct answer is required`
            );
        } else if (correctAnswerCount > 1) {
            throw new UserInputError(
                `Question ${question_idx + 1}: Only 1 correct answer is allowed`
            );
        }
    });
    return next();
};
