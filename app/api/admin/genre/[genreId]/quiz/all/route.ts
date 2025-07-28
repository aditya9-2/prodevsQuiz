import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest,
    { params }: { params: { genreId: string } }
) {

    try {

        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN") {
            return NextResponse.json({
                message: "Unauthorized! You are not an admin"
            }, { status: 403 });
        }

        const genreId = Number(await params.genreId);

        if (isNaN(genreId)) {
            return NextResponse.json(
                { message: "Invalid genreId" },
                { status: 400 }
            );
        }


        const allQuizzes = await client.quiz.findMany({
            where: {
                genreId
            },
            include: {
                genre: true,
                Question: true
            }
        });

        return NextResponse.json(
            {
                message: "Quizzes under the specified genre fetched successfully",
                quizzes: allQuizzes
            },
            { status: 200 }
        );

    } catch (err) {

        return NextResponse.json({
            message: "failed to fetch quizzes",
            details: err instanceof Error ? err.message : err
        });
    }
}