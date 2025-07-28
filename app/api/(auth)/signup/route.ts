import { client } from "@/db";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password) {
            return NextResponse.json({
                message: "All fields are required"
            }, { status: 400 });
        }

        const existingUser = await client.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({
                message: "Email already exists"
            }, { status: 400 });
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await client.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "USER"
            }
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            message: "user created successfully",
            user: userWithoutPassword
        }, { status: 201 });

    } catch (err) {
        return NextResponse.json({
            message: "failed to signup",
            details: err instanceof Error ? err.message : err
        }, { status: 400 });
    }
}
