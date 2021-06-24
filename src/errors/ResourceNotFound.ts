import { ApolloError } from "apollo-server";

const RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND";

export class ResourceNotFound extends ApolloError {
    constructor(message: string) {
        super(message, RESOURCE_NOT_FOUND);
    }
}
