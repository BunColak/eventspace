import bcrypt, { hash } from "bcryptjs";
import {
    createCookieSessionStorage, redirect
} from "remix";
import { db } from "../db.server";


type LoginForm = {
    username: string;
    password: string;
};

export async function login({
    username,
    password,
}: LoginForm) {
    const user = await db.user.findUnique({
        where: { username },
    });
    if (!user) return null;
    const isCorrectPassword = await bcrypt.compare(
        password,
        user.password
    );
    if (!isCorrectPassword) return null;
    return { id: user.id, username };
}

export const register = async (username: string, email: string, password: string) => {
    const hashedPassword = await hash(password, 10);
    const user = await db.user.create({
        data: { username, email, password: hashedPassword },
    });
    return user
}


export async function logout(request: Request) {
    const session = await getUserSession(request);
    throw redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "eventspace_session",
        secure: true,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
    },
});

export async function createUserSession(
    userId: number,
    redirectTo: string
) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "number") return null;
    return userId;
}

export async function requireUserId(
    request: Request,
    redirectTo: string = new URL(request.url).pathname
) {
    const session = await getUserSession(request);
    const userId = session.get("userId");

    if (!userId || typeof userId !== "number") {
        const searchParams = new URLSearchParams([
            ["redirectTo", redirectTo],
        ]);        
        throw redirect(`/login?${searchParams}`);
    }
    return userId;
}

export const noLoginRequired = async (request: Request) => {
    const userId = await getUserId(request);
    console.log({userId});
    

    if (userId) {
        throw redirect("/");
    }

    return null
}