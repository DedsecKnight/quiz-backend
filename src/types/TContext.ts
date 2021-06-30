import { Request } from "express";
import { IncomingHttpHeaders } from "http2";

export interface MyHeader extends IncomingHttpHeaders {
    authorization: string;
    refreshtoken: string;
}

export interface UserData {
    id: number;
}

export interface TContext extends Request {
    user: UserData;
    headers: MyHeader;
}
