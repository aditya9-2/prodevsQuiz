import { NextRequest, NextResponse } from "next/server";
import { Role } from "./app/generated/prisma";
// import jwt from "jsonwebtoken";
import { jwtVerify } from "jose"

interface RequestWithUser extends NextRequest {
    user?: {
        id: number | string;
        role: Role
    }
}

export const config = {
    matcher: ["/api/admin/genres/create"],
};

export async function middleware(req: RequestWithUser) {

    try {

        const token = req.headers.get("authorization")?.split(" ")[1];

        if (!token) {
            return NextResponse.json({
                message: "No token provided"
            }, { status: 401 });
        }
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        const { payload } = await jwtVerify(token, secret);
        console.log("Decoded JWT payload:", payload)
        const user = payload as {
            id: number | string,
            role: Role
        }

        // const user = await jwt.verify(token, process.env.JWT_SECRET_KEY!) as { id: number | string, Role: Role };

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", String(user.id));
        requestHeaders.set("x-user-role", user.role);

        return NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });

    } catch (err) {

        return NextResponse.json({
            message: "failed to authenticate",
            details: err instanceof Error ? err.message : err
        }, { status: 500 })

    }
}
