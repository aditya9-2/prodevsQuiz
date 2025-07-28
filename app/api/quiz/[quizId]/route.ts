import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { quizId: string } }
) {
    try {
        const quizId = Number(params.quizId);

        if (isNaN(quizId)) {
            return NextResponse.json({ message: "Invalid quizId" }, { status: 400 });
        }

        const quiz = await client.quiz.findUnique({
            where: { id: quizId },
            include: {
                genre: {
                    select: { id: true, title: true }
                },
                Question: {
                    select: {
                        ind: true,
                        questiontext: true,
                        options: true
                    }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
        }

        return NextResponse.json(
            {
                message: "Quiz fetched successfully",
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    genre: quiz.genre,
                    questions: quiz.Question
                }
            },
            { status: 200 }

        );
    } catch (err) {

        return NextResponse.json(
            {
                message: "Failed to fetch quiz",
                details: err instanceof Error ? err.message : err
            },
            { status: 500 }
        );
    }
}
