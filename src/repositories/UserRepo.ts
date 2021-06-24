import { User } from "../entity/User";
import { IUserRepo, AuthResponse } from "../interfaces/IUserRepo";
import * as bcrypt from "bcrypt";
import { injectable } from "inversify";
import { AuthenticationError, UserInputError } from "apollo-server";
import { ResourceNotFound } from "../errors/ResourceNotFound";
import { generateToken } from "../jwt/jwt";

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
                throw new ResourceNotFound("User does not exist");

            const checkValid = await bcrypt.compare(
                password,
                existingUser.password
            );
            if (!checkValid)
                throw new AuthenticationError("Invalid credentials");

            return {
                statusCode: 200,
                token: generateToken({
                    id: existingUser.id,
                }),
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
            if (existingUser) throw new UserInputError("User already exist");

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await this.initializeObj(
                name,
                email,
                hashedPassword
            );

            return {
                statusCode: 200,
                token: generateToken({
                    id: newUser.id,
                }),
            };
        } catch (error) {
            console.log(error.message);
        }
    }
}
