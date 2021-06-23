import { Request } from "express";
import { IncomingHttpHeaders } from "http2";

interface UserHeader {
    id: number;
}

export interface TContext extends Request {
    user: UserHeader;
}
