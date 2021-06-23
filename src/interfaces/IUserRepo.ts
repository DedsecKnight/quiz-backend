import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../entity/User";

@ObjectType()
export class AuthResponse {
    @Field(() => Int)
    statusCode: number;

    @Field({ nullable: true })
    token: string;

    @Field({ nullable: true })
    error: string;
}

export interface IUserRepo {
    findById: (id: number) => Promise<User>;
    findByEmail: (email: string) => Promise<User>;
    getAll: () => Promise<User[]>;
    loginUser: (email: string, password: string) => Promise<AuthResponse>;
    registerUser: (
        name: string,
        email: string,
        password: string
    ) => Promise<AuthResponse>;
    initializeObj: (
        name: string,
        email: string,
        password: string
    ) => Promise<User>;
}
