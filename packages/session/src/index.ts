import { IronSession, IronSessionOptions } from "iron-session";

export type SessionData = IronSession & { userName?: string, tenantId?: number, tenantName?: string, isAdmin?: boolean, authenticated?: boolean; };

export const sessionOpts: IronSessionOptions = {
    password: process.env.COOKIE_SECRET as string,
    cookieName: process.env.COOKIE_NAME as string,
    cookieOptions: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/'
    },
};