import { injectable } from "inversify";
import { getManager } from "typeorm";
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
        return newSubmission;
    }
    findById(id: number): Promise<Submission> {
        return Submission.findOne(id);
    }
    async getScore(submissionId: number): Promise<number> {
        const queryData = await getManager().query(`
            select count(case when answer.isCorrect = 1 then 1 end) * 100 / count(*) as score, submission.userId from submission 
            inner join submission_answer on submission.id = submission_answer.submissionId
            inner join answer on submission_answer.answerId = answer.id
            where submission.id = ${submissionId}
        `);
        return parseInt(queryData[0].score);
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
