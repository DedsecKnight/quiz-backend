import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../entity/User";

@ObjectType()
export class AuthResponse {
    @Field(() => Int)
    statusCode: number;

    @Field()
    token: string;
}

@ObjectType()
export class UserScore {
    @Field(() => Int)
    totalScore: number;

    @Field(() => Int)
    maxScore: number;
}

export interface IUserRepo {
    findById: (id: number) => Promise<User>;
    findByEmail: (email: string) => Promise<User>;
    getAll: () => Promise<User[]>;
    initializeObj: (
        name: string,
        email: string,
        password: string
    ) => Promise<User>;
    getScore: (id: number) => Promise<UserScore[]>;
}
