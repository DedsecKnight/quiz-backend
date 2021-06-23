import { User } from "../entity/User";
import { IUserRepo, AuthResponse } from "../interfaces/IUserRepo";
import * as bcrypt from "bcrypt";
import { injectable } from "inversify";

@injectable()
export class UserRepo implements IUserRepo {
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

    async loginUser(email: string, password: string): Promise<AuthResponse> {
        try {
            const existingUser = await this.findByEmail(email);
            if (!existingUser)
                return {
                    statusCode: 401,
                    token: "",
                    error: "User does not exist",
                };

            const checkValid = await bcrypt.compare(
                password,
                existingUser.password
            );
            if (!checkValid)
                return {
                    statusCode: 401,
                    token: "",
                    error: "Invalid credentials",
                };

            return {
                statusCode: 200,
                error: "",
                token: "TokenGoesHere",
            };
        } catch (error) {
            console.log(error);
        }
    }

    async registerUser(
        name: string,
        email: string,
        password: string
    ): Promise<AuthResponse> {
        try {
            const existingUser = await this.findByEmail(email);
            if (existingUser)
                return {
                    statusCode: 400,
                    error: "User already exists",
                    token: "",
                };

            const hashedPassword = await bcrypt.hash(password, 10);
            await this.initializeObj(name, email, hashedPassword);

            return {
                statusCode: 200,
                error: "",
                token: "TokenGoesHere",
            };
        } catch (error) {
            console.log(error.message);
        }
    }
}
