import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

@Resolver(User)
export class UserResolver {
    @Query(() => [User])
    async users(): Promise<User[]> {
        try {
            const users = await User.find();
            return users;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    @Query(() => String)
    async login(
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<String> {
        try {
            const existingUser = await User.findOne({
                email,
            });
            if (!existingUser) throw new Error("No such user exists");

            const validPassword = await bcrypt.compare(
                password,
                existingUser.password
            );
            if (!validPassword) throw new Error("Invalid credentials");
            return "TokenGoesHere";
        } catch (error) {
            console.log(error.message);
        }
    }

    @Query(() => User)
    async me(@Arg("userId") userId: number): Promise<User | null> {
        const user = await User.findOne(
            {
                id: userId,
            },
            {
                relations: ["submissions"],
            }
        );
        if (!user) return null;
        return user;
    }

    @Mutation(() => String)
    async registerUser(
        @Arg("name") name: string,
        @Arg("email") email: string,
        @Arg("password") password: string
    ): Promise<String> {
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) throw new Error("Email is already used");

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                name,
                email,
                password: hashedPassword,
            }).save();

            return "TokenGoesHere";
        } catch (error) {
            console.log(error.message);
        }
    }
}
