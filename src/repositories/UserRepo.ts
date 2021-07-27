import { User } from "../entity/User";
import { IUserRepo, UserScore } from "../interfaces/IUserRepo";
import { inject, injectable } from "inversify";
import { getManager } from "typeorm";
import { TYPES } from "../inversify.types";
import { ISubmissionRepo } from "../interfaces/ISubmissionRepo";

@injectable()
export class UserRepo implements IUserRepo {
    @inject(TYPES.ISubmissionRepo) private _submissionRepo: ISubmissionRepo;

    findById(id: number): Promise<User> {
        return User.findOne({ id });
    }

    initializeObj(
        name: string,
        email: string,
        password: string
    ): Promise<User> {
        return User.create({ name, email, password }).save();
    }

    getAll(): Promise<User[]> {
        return User.find();
    }

    findByEmail(email: string): Promise<User> {
        return User.findOne({ email });
    }

    async getScore(userId: number): Promise<UserScore> {
        const queryData: { totalScore: string; maxScore: string } =
            await getManager()
                .createQueryBuilder()
                .select("sum(score)", "totalScore")
                .addSelect("max(score)", "maxScore")
                .from((subQuery) => {
                    // Get max score of each quizzes attempted by user
                    return subQuery
                        .from(
                            `(${this._submissionRepo.getScoreAllSubmissions()})`,
                            "T"
                        )
                        .select("max(score)", "score")
                        .where("T.userId = :userId", { userId })
                        .groupBy("T.quizId");
                }, "T2")
                .getRawOne();

        return {
            maxScore: parseInt(queryData.maxScore) || 0,
            totalScore: parseInt(queryData.totalScore) || 0,
        };
    }

    findByIds(ids: number[]): Promise<User[]> {
        return User.findByIds(ids);
    }
}
