import { client } from "@/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function POST(req: Request) {

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

        const token = jwt.sign({
            id: user.id
        }, process.env.JWT_SECRET_KEY!);

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