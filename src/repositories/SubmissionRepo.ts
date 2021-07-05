import { injectable } from "inversify";
import { Answer } from "../entity/Answer";
import { Submission } from "../entity/Submission";
import { CountData } from "../interfaces/ICountData";
import { ISubmissionRepo, SubmissionArg } from "../interfaces/ISubmissionRepo";

@injectable()
export class SubmissionRepo implements ISubmissionRepo {
    async createSubmission({
        userId,
        quizId,
        answers,
    }: SubmissionArg): Promise<Submission> {
        const newSubmission = await Submission.create({
            userId,
            quizId,
        }).save();
        answers.forEach(async (answerId) => {
            const fetchedAnswer = await Answer.findOne({
                id: answerId,
            });
            await Submission.createQueryBuilder()
                .relation(Submission, "answers")
                .of(newSubmission)
                .add(fetchedAnswer);
        });
        return Submission.findOne(
            {
                id: newSubmission.id,
            },
            {
                relations: ["answers"],
            }
        );
    }
    findById(id: number): Promise<Submission> {
        return Submission.findOne(id);
    }
    async getScore(submissionId: number): Promise<number> {
        const subObj = await Submission.findOne(
            {
                id: submissionId,
            },
            {
                relations: ["answers"],
            }
        );
        return Math.floor(
            (subObj.answers.filter((answer) => answer.isCorrect).length * 100) /
                subObj.answers.length
        );
    }
    getUserSubmissions(userId: number): Promise<Submission[]> {
        return Submission.find({
            where: { userId },
        });
    }
    getUserSubmissionsWithOffsetAndLimit(
        userId: number,
        offset: number,
        limit: number
    ): Promise<Submission[]> {
        return Submission.createQueryBuilder("submission")
            .skip(offset)
            .take(limit)
            .where("submission.userId = :userId", { userId })
            .getMany();
    }

    getUserRecentSubmissions(
        userId: number,
        limit: number
    ): Promise<Submission[]> {
        return Submission.createQueryBuilder("submission")
            .where("submission.userId = :userId", { userId })
            .innerJoinAndSelect("submission.answers", "answer")
            .innerJoinAndSelect("submission.quiz", "quiz")
            .innerJoinAndSelect("quiz.difficulty", "difficulty")
            .orderBy("submission.id", "DESC")
            .take(limit)
            .getMany();
    }

    async getUserSubmissionsCount(userId: number): Promise<CountData> {
        try {
            const count = await Submission.createQueryBuilder("submission")
                .where("submission.userId = :userId", { userId })
                .getCount();
            return Promise.resolve({ count });
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
