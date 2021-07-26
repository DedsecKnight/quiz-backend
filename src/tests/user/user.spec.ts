import { ApolloServer, gql } from "apollo-server";
import { buildSchema } from "type-graphql";
import { Connection } from "typeorm";
import { createMockConnection } from "../mock/MockConnection";
import { UserResolver } from "../../resolvers/user/user.resolver";
import { ServerContext } from "../../server.config";
import { createMockUser } from "../mock/CreateMockObj";
import { generateRefreshToken, generateToken } from "../../jwt/jwt";

let server: ApolloServer;
let connection: Connection;

beforeAll(async () => {
    connection = await createMockConnection();

    const schema = await buildSchema({
        resolvers: [UserResolver],
    });

    await createMockUser();

    let token = generateToken({
        id: 1,
    });
    let refreshtoken = generateRefreshToken({
        id: 1,
    });

    server = new ApolloServer({
        schema,
        context: ({ req }) =>
            ServerContext({
                ...req,
                headers: {
                    authorization: `Bearer ${token}`,
                    refreshtoken,
                },
            }),
    });
});

describe("Register User", () => {
    test("Create new User", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Register(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    registerUser(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                name: "Test1234",
                email: "test2@test.com",
                password: "test1234",
            },
        });
        expect(data.data!.registerUser.token).toBeTruthy();
        expect(data.data!.registerUser.refreshToken).toBeTruthy();
    });

    test("Create already exists user", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Register(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    registerUser(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                name: "Test123",
                email: "test@test.com",
                password: "test1234",
            },
        });
        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("Create user failed");
        expect(data.errors[0].extensions.validationErrors).toEqual({
            message: "User already exists",
        });
    });

    test("Invalid email", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Register(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    registerUser(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                name: "Test123",
                email: "test",
                password: "test1234",
            },
        });
        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("Credentials validation failed");
        expect(data.errors[0].extensions.validationErrors).toEqual({
            email: "Invalid email format",
        });
    });

    test("Password less than 8 characters", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Register(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    registerUser(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                name: "Test123",
                email: "test@test123.com",
                password: "test",
            },
        });
        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("Credentials validation failed");
        expect(data.errors[0].extensions.validationErrors).toEqual({
            password: "Password has to have at least 8 characters",
        });
    });

    test("Multiple validation errors", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Register(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    registerUser(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                name: "Test123",
                email: "test",
                password: "test",
            },
        });
        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("Credentials validation failed");
        expect(data.errors[0].extensions.validationErrors).toEqual({
            email: "Invalid email format",
            password: "Password has to have at least 8 characters",
        });
    });
});

describe("Login User", () => {
    test("Login", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                email: "test@test.com",
                password: "test1234",
            },
        });
        expect(data.data!.login.token).toBeTruthy();
        expect(data.data!.login.refreshToken).toBeTruthy();
    });

    test("Login with non-existing user", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                email: "noexisto@test.com",
                password: "test1234",
            },
        });

        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("User does not exist");
    });

    test("Login with invalid credentials", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                email: "test@test.com",
                password: "test12345",
            },
        });

        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe("Invalid credentials");
    });

    test("Invalid email format", async () => {
        const data = await server.executeOperation({
            query: gql`
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                email: "test",
                password: "test1234",
            },
        });

        expect(data.data).toBe(null);
        expect(data.errors[0].message).toBe(
            "Login failed due to validation errors"
        );
        expect(data.errors[0].extensions.validationErrors).toEqual({
            email: "Invalid email format",
        });
    });
});

describe("User Query", () => {
    test("Get User Info", async () => {
        const data = await server.executeOperation({
            query: gql`
                query GetUserInfo {
                    myInfo {
                        name
                        email
                    }
                }
            `,
        });
        const { myInfo } = data.data;
        expect(myInfo.name).toBe("Test123");
        expect(myInfo.email).toBe("test@test.com");
    });
});

describe("Update Profile", () => {
    test("Update all fields", async () => {
        await server.executeOperation({
            query: gql`
                mutation UpdateUserProfile(
                    $name: String!
                    $email: String!
                    $password: String!
                ) {
                    updateProfile(
                        name: $name
                        email: $email
                        password: $password
                    ) {
                        email
                    }
                }
            `,
            variables: {
                name: "NewTest",
                email: "test123@test.com",
                password: "newtest1234",
            },
        });

        const data = await server.executeOperation({
            query: gql`
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                        refreshToken
                    }
                }
            `,
            variables: {
                email: "test123@test.com",
                password: "newtest1234",
            },
        });

        const { login } = data.data;
        expect(login.token).toBeTruthy();
        expect(login.refreshToken).toBeTruthy();
    });
});

afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
});
