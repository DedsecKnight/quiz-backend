import { injectable } from "inversify";
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
        await Submission.createQueryBuilder("submission")
            .relation("answers")
            .of(newSubmission)
            .add(answers);
        return newSubmission;
    }

    findById(id: number): Promise<Submission> {
        return Submission.findOne(id);
    }

    findByIdsWithAnswers(ids: number[]): Promise<Submission[]> {
        return Submission.createQueryBuilder("submission")
            .leftJoinAndSelect("submission.answers", "answer")
            .where("submission.id in (:...ids)", { ids })
            .getMany();
    }

    async getScore(submissionId: number): Promise<number> {
        const queryData: { score: string } =
            await Submission.createQueryBuilder("submission")
                .leftJoinAndSelect("submission.answers", "answer")
                .select(
                    "count(case when answer.isCorrect = 1 then 1 end) * 100 / count(*)",
                    "score"
                )
                .where("submission.id = :submissionId", { submissionId })
                .getRawOne();
        if (!queryData) return 0;
        return parseInt(queryData.score);
    }

    async getScores(
        submissionIds: number[]
    ): Promise<Array<{ id: number; score: number }>> {
        const queryData: Array<{ id: number; score: string }> =
            await Submission.createQueryBuilder("submission")
                .leftJoinAndSelect("submission.answers", "answer")
                .select(
                    "count(case when answer.isCorrect = 1 then 1 end) * 100 / count(*)",
                    "score"
                )
                .addSelect("submission.id", "id")
                .where("submission.id in (:...ids)", { ids: submissionIds })
                .groupBy("submission.id")
                .getRawMany();
        return queryData.map(({ id, score }) => ({
            id,
            score: parseInt(score),
        }));
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

    getScoreAllSubmissions(): string {
        return Submission.createQueryBuilder("submission")
            .innerJoinAndSelect("submission.answers", "answer")
            .select([
                "submission.userId AS userID",
                "submission.quizId AS quizId",
                "(sum(answer.isCorrect) / count(*))*100 AS score ",
            ])
            .groupBy("submission.id")
            .getQuery();
    }
}
