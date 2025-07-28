import { client } from "@/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken"
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json({
                message: "All fields are required",
            }, { status: 400 });
        }

        const user = await client.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({
                message: "user not found in DB"
            }, { status: 400 });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json({
                message: "wrong password!"
            }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY!);
        const token = await new SignJWT({ id: user.id, role: user.role })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret);

        return NextResponse.json({
            message: "Signin successful",
            token
        });

    } catch (err) {

        return NextResponse.json({
            message: "failed to signin",
            details: err instanceof Error ? err.message : err
        }, { status: 500 });

    }
}