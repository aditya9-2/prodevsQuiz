import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {


    try {

        const userIdHeader = req.headers.get("x-user-id");

        if (!userIdHeader) {
            return NextResponse.json({
                message: "User ID is required"
            }, { status: 400 });
        }

        const userId = Number(userIdHeader);

        if (isNaN(userId)) {
            return NextResponse.json({
                message: "Invalid User ID"
            }, { status: 400 });
        }

        const user = await client.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!user) {
            return NextResponse.json({
                message: "User not found"
            }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile retrieved successfully",
            user
        }, { status: 200 });

    } catch (err) {

        return NextResponse.json({
            message: "Unable to get profile",
            details: err instanceof Error ? err.message : err
        }, { status: 500 })

    }
}