import { Submission } from "../entity/Submission";

export interface SubmissionArg {
    userId: number;
    quizId: number;
    answers: number[];
}

export interface ISubmissionRepo {
    getUserSubmissions: (userId: number) => Promise<Submission[]>;
    createSubmission: (arg: SubmissionArg) => Promise<Submission>;
    findById: (id: number) => Promise<Submission>;
    getScore: (submissionId: number) => Promise<number>;
    getUserSubmissionsWithOffsetAndLimit: (
        userId: number,
        offset: number,
        limit: number
    ) => Promise<Submission[]>;
    getUserRecentSubmissions: (
        userId: number,
        limit: number
    ) => Promise<Submission[]>;
}
