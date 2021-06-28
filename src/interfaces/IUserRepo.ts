import { Field, Int, ObjectType } from "type-graphql";
import { User } from "../entity/User";

@ObjectType()
export class AuthResponse {
    @Field(() => Int)
    statusCode: number;

    @Field()
    token: string;
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
}
