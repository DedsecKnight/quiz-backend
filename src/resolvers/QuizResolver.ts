import { NonNullTypeNode } from "graphql";
import {
    Arg,
    InputType,
    Field,
    ID,
    Mutation,
    Resolver,
    Query,
} from "type-graphql";
import { Answer } from "../entity/Answer";
import { Category } from "../entity/Category";
import { Difficulty } from "../entity/Difficulty";
import { Question } from "../entity/Question";
import { Quiz } from "../entity/Quiz";
import { User } from "../entity/User";

@InputType()
class AnswerArgs {
    @Field()
    answer: string;

    @Field()
    isCorrect: boolean;
}

@InputType()
class QuestionArgs {
    @Field()
    question: string;

    @Field(() => [AnswerArgs])
    answers: AnswerArgs[];
}

@InputType()
class QuizArgs {
    @Field(() => ID)
    userId: number;

    @Field()
    quizName: string;

    @Field(() => [QuestionArgs])
    questions: QuestionArgs[];

    @Field()
    category: string;

    @Field()
    difficulty: string;
}

@Resolver(Quiz)
export class QuizResolver {
    @Mutation(() => Quiz)
    async createQuiz(
        @Arg("quiz")
        { userId, quizName, questions, difficulty, category }: QuizArgs
    ): Promise<Quiz> {
        try {
            // Check if userId is valid
            const author = await User.findOne({ id: userId });
            if (!author) throw new Error("User does not exist");

            // Check if a valid difficulty is given
            const difficultyObj = await Difficulty.findOne({
                type: difficulty,
            });
            if (!difficultyObj) throw new Error("Invalid difficulty");

            // Create new category if necessary
            let categoryObj = await Category.findOne({
                categoryName: category,
            });
            if (!categoryObj) {
                categoryObj = Category.create({
                    categoryName: category,
                });
                await categoryObj.save();
            }

            // Create a new Quiz object
            const newQuiz = await Quiz.create({
                quizName,
                authorId: userId,
                difficultyId: difficultyObj.id,
                categoryId: categoryObj.id,
            }).save();

            questions.forEach(async (q) => {
                const { question, answers } = q;
                const newQuestion = await Question.create({
                    question,
                    quizId: newQuiz.id,
                }).save();
                answers.forEach(async (a) => {
                    const { answer, isCorrect } = a;
                    await Answer.create({
                        answer,
                        isCorrect,
                        questionId: newQuestion.id,
                    }).save();
                });
            });

            return newQuiz;
        } catch (error) {
            console.log(error.message);
        }
    }

    @Query(() => Difficulty)
    async quizByDifficulty(
        @Arg("difficulty") difficulty: string
    ): Promise<Difficulty | null> {
        const difficultyObj = await Difficulty.findOne(
            {
                type: difficulty,
            },
            {
                relations: [
                    "quizzes",
                    "quizzes.questions",
                    "quizzes.questions.answers",
                    "quizzes.category",
                ],
            }
        );
        if (!difficultyObj) return null;
        return difficultyObj;
    }

    @Query(() => Category)
    async quizByCategories(
        @Arg("category") category: string
    ): Promise<Category | null> {
        const categoryObj = await Category.findOne(
            {
                categoryName: category,
            },
            {
                relations: [
                    "quizzes",
                    "quizzes.questions",
                    "quizzes.questions.answers",
                    "quizzes.difficulty",
                    "quizzes.category",
                ],
            }
        );
        if (!categoryObj) return null;
        return categoryObj;
    }

    @Query(() => Quiz)
    async quizById(@Arg("id") id: number): Promise<Quiz | NonNullTypeNode> {
        const quiz = await Quiz.findOne(
            { id },
            {
                relations: [
                    "difficulty",
                    "questions",
                    "questions.answers",
                    "submissions",
                    "category",
                ],
            }
        );
        if (!quiz) return null;
        return quiz;
    }

    @Query(() => [Quiz])
    async quizzes(): Promise<Quiz[]> {
        return Quiz.find({
            relations: [
                "difficulty",
                "questions",
                "questions.answers",
                "submissions",
                "category",
            ],
        });
    }

    @Query(() => [Quiz])
    async quizzesByUser(@Arg("userId") id: number): Promise<Quiz[] | null> {
        const user = await User.findOne(
            {
                id,
            },
            {
                relations: [
                    "quizzes",
                    "quizzes.questions",
                    "quizzes.questions.answers",
                ],
            }
        );
        if (!user) return null;
        return user.quizzes;
    }
}
