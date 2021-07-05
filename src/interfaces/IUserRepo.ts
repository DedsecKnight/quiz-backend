import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../entity/User";

@ObjectType()
export class AuthResponse {
    @Field()
    token: string;

    @Field()
    refreshToken: string;
}

@ObjectType()
export class UserScore {
    @Field(() => Int)
    totalScore: number;

    @Field(() => Int)
    maxScore: number;
}

export interface IUserRepo {
    // Find a user with a given id
    findById: (id: number) => Promise<User>;

    // Find a user with given email
    findByEmail: (email: string) => Promise<User>;

    // Get all users
    getAll: () => Promise<User[]>;

    // Initialize a new User object
    initializeObj: (
        name: string,
        email: string,
        password: string
    ) => Promise<User>;

    // Get total and max score among all submissions of a user
    // id: id of target user
    getScore: (id: number) => Promise<UserScore[]>;

    // Get user by list of id
    // ids: array of ids
    findByIds: (ids: number[]) => Promise<User[]>;
}
