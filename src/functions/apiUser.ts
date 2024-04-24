import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";
import { errorHandle } from "../shared/utils/errorHandle";
import { schema } from "../shared/utils/validators";

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "UserTable";
const headers = {
    "content-type": "application/json",
};

class HttpError extends Error {
    constructor(public statusCode: number, body: Record<string, unknown> = {}) {
        super(JSON.stringify(body));
    }
}

const getUsers = async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const result = await dynamoDb.scan({
            TableName: tableName
        }).promise();

        const users = result.Items;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(users)
        };
    }
    catch (err) {
        return errorHandle(err);
    }

};

const getUserById = async (id: string) => {
    const output = await dynamoDb
        .get({
            TableName: tableName,
            Key: {
                userID: id,
            },
        })
        .promise();

    if (!output?.Item) {
        throw new HttpError(404, { error: "NOT FOUND" });       
    }

    return output.Item;
};

const addUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const reqBody = JSON.parse(event.body as string);
        const createdAt = new Date().toUTCString();
        const userID = v4();

        await schema.validate(reqBody, { abortEarly: false });

        const newUser = {
            userID,
            createdAt,
            ...reqBody,
        };

        await dynamoDb.put({
            TableName: tableName,
            Item: newUser
        }).promise();

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(newUser)
        };

    } catch (err) {
        return errorHandle(err);
    }
};

const getUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const user = await getUserById(event.pathParameters?.userID as string);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(user)
        };

    } catch (err) {
        return errorHandle(err);
    }
};

const updateUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userID = event.pathParameters?.userID as string;        
        await getUserById(userID);
        const reqBody = JSON.parse(event.body as string);
        await schema.validate(reqBody, { abortEarly: false });

        const user = {
            ...reqBody,
            userID,
          };

        await dynamoDb
        .put({
          TableName: tableName,
          Item: user,
        })
        .promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User updated successfully'
            }),
        };

    } catch (err) {
        return errorHandle(err);
    }
};

const deleteUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const userID = event.pathParameters?.userID as string;

        await getUserById(userID);

        await dynamoDb.delete({
            TableName: tableName,
            Key: {
                userID: userID
            },
        }).promise();
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'User deleted successfully'
            }),
        };

    } catch (err) {
        return errorHandle(err);
    }
};

module.exports = {
    getUsers,
    addUser,
    getUser,
    updateUser,
    deleteUser
};