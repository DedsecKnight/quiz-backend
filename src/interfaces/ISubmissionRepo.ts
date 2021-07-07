import { Submission } from "../entity/Submission";
import { CountData } from "./ICountData";

export interface SubmissionArg {
    userId: number;
    quizId: number;
    answers: number[];
}

export interface ISubmissionRepo {
    // Get all submissions of a given user
    getUserSubmissions: (userId: number) => Promise<Submission[]>;

    // Create a new submission (called when user makes a submission)
    createSubmission: (arg: SubmissionArg) => Promise<Submission>;

    // Find a submission with a given id
    findById: (id: number) => Promise<Submission>;

    // Find list of submissions with a given id list
    // (With answers eagerly loaded)
    findByIdsWithAnswers: (ids: number[]) => Promise<Submission[]>;

    // Get score of the submission with given id
    getScore: (submissionId: number) => Promise<number>;

    // Get score of the submission with given id
    getScores: (
        submissionIds: number[]
    ) => Promise<Array<{ id: number; score: number }>>;

    // Get all submissions of a user (pagination)
    // offset: number of submissions to skip
    // limit: number of submissions to get
    getUserSubmissionsWithOffsetAndLimit: (
        userId: number,
        offset: number,
        limit: number
    ) => Promise<Submission[]>;

    // Get recent submissions of a user
    // limit: number of submissions to get
    getUserRecentSubmissions: (
        userId: number,
        limit: number
    ) => Promise<Submission[]>;

    // Get count of all submissions made by a user
    getUserSubmissionsCount: (userId: number) => Promise<CountData>;

    // Return SQL query to fetch score of all submissions
    getScoreAllSubmissions: () => string;
}
