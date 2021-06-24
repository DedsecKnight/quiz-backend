import { Request } from "express";
import { IncomingHttpHeaders } from "http2";

export interface UserData {
    id: number;
}

export interface TContext extends Request {
    user: UserData;
}
