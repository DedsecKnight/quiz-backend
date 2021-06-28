import { User } from "../entity/User";
import { IUserRepo } from "../interfaces/IUserRepo";
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
}
