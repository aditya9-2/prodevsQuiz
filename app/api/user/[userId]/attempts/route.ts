import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const userId = Number(params.userId);
        if (isNaN(userId)) {
            return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
        }

        const attempts = await client.quizAttempt.findMany({
            where: { userId },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        genre: { select: { id: true, title: true } }
                    }
                }
            },
            orderBy: { id: "desc" }
        });

        return NextResponse.json({
            message: "User attempts fetched successfully",
            attempts
        });

    } catch (err) {
        return NextResponse.json({
            message: "Failed to fetch user attempts",
            details: err instanceof Error ? err.message : String(err)
        }, { status: 500 });
    }
}
