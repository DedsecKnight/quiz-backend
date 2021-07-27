import { inject, injectable } from "inversify";
import { Quiz } from "../entity/Quiz";
import { IAnswerRepo } from "../interfaces/IAnswerRepo";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";
import { CountData } from "../interfaces/ICountData";
import { IDifficultyRepo } from "../interfaces/IDifficultyRepo";
import { IQuestionRepo } from "../interfaces/IQuestionRepo";
import { IQuizArgs, IQuizRepo } from "../interfaces/IQuizRepo";
import { IUserRepo } from "../interfaces/IUserRepo";
import { TYPES } from "../inversify.types";

@injectable()
export class QuizRepo implements IQuizRepo {
    @inject(TYPES.ICategoryRepo) private _categoryRepo: ICategoryRepo;
    @inject(TYPES.IDifficultyRepo) private _difficultyRepo: IDifficultyRepo;
    @inject(TYPES.IQuestionRepo) private _questionRepo: IQuestionRepo;
    @inject(TYPES.IAnswerRepo) private _answerRepo: IAnswerRepo;
    @inject(TYPES.IUserRepo) private _userRepo: IUserRepo;

    async initializeObj(
        quizName: string,
        authorId: number,
        difficultyId: number,
        categoryId: number
    ): Promise<Quiz> {
        return Quiz.create({
            quizName,
            authorId,
            difficultyId,
            categoryId,
        }).save();
    }

    async createQuiz(quizArg: IQuizArgs): Promise<Quiz> {
        // Destruct parameter
        const { userId, quizName, questions, difficulty, category } = quizArg;

        // Get difficulty object
        const diffObj = await this._difficultyRepo.getObjByType(difficulty);

        // Find or create new Category
        const catObj = await this._categoryRepo.findOrCreate(category);

        // Create new quiz
        const newQuiz = await this.initializeObj(
            quizName,
            userId,
            diffObj.id,
            catObj.id
        );

        // Populate quiz with questions and answers
        for (let { question, answers } of questions) {
            // Create a question
            const newQuestion = await this._questionRepo.initializeObj(
                question,
                newQuiz.id
            );

            // Create answers for each answer
            for (let { answer, isCorrect } of answers) {
                await this._answerRepo.initializeObj(
                    answer,
                    isCorrect,
                    newQuestion.id
                );
            }
        }

        return newQuiz;
    }
    async findAll(searchQuery: string): Promise<Quiz[]> {
        if (searchQuery === "") return Quiz.find();
        return Quiz.createQueryBuilder("quiz")
            .where(`LOWER(quiz.quizName) LIKE :query`, {
                query: `%${searchQuery.toLowerCase()}%`,
            })
            .getMany();
    }

    async findById(id: number): Promise<Quiz> {
        return Quiz.findOne({ id });
    }

    findByIds(ids: number[]): Promise<Quiz[]> {
        return Quiz.findByIds(ids);
    }

    findByIdsWithQuestions(ids: number[]): Promise<Quiz[]> {
        return Quiz.createQueryBuilder("quiz")
            .leftJoinAndSelect("quiz.questions", "question")
            .where("quiz.id in (:...ids)", { ids })
            .getMany();
    }

    async findByAuthor(authorId: number): Promise<Quiz[]> {
        return Quiz.find({
            where: { authorId },
        });
    }

    async findByName(name: string): Promise<Quiz> {
        return Quiz.createQueryBuilder("quiz")
            .where("LOWER(quiz.quizName) = LOWER(:name)", { name })
            .getOne();
    }

    findByDifficulty(difficultyId: number): Promise<Quiz[]> {
        return Quiz.find({
            where: {
                difficultyId,
            },
        });
    }

    findByCategory(categoryId: number): Promise<Quiz[]> {
        return Quiz.find({
            where: {
                categoryId,
            },
        });
    }

    async findWithOffsetAndLimit(
        offset: number,
        limit: number,
        searchQuery: string
    ): Promise<Quiz[]> {
        if (searchQuery === "")
            return Quiz.createQueryBuilder("quiz")
                .skip(offset)
                .take(limit)
                .getMany();
        return Quiz.createQueryBuilder("quiz")
            .where(`LOWER(quiz.quizName) LIKE :query`, {
                query: `%${searchQuery.toLowerCase()}%`,
            })
            .skip(offset)
            .take(limit)
            .getMany();
    }

    async getUserQuizCount(userId: number): Promise<CountData> {
        try {
            const count = await Quiz.createQueryBuilder("quiz")
                .where("quiz.authorId = :userId", { userId })
                .getCount();
            return Promise.resolve({ count });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getAllQuizCount(searchQuery: string): Promise<CountData> {
        try {
            const count =
                searchQuery === ""
                    ? await Quiz.createQueryBuilder("quiz").getCount()
                    : await Quiz.createQueryBuilder("quiz")
                          .where(`LOWER(quiz.quizName) LIKE :query`, {
                              query: `%${searchQuery.toLowerCase()}%`,
                          })
                          .getCount();
            return Promise.resolve({ count });
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async checkIfAnswersBelongToQuiz(
        answerIds: number[],
        quizId: string
    ): Promise<boolean> {
        const quizList = await this._answerRepo.mapAnswerToQuiz(answerIds);
        return quizList.filter((qId) => qId !== parseInt(quizId)).length === 0;
    }
}
