import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { genreId: string } }) {
    try {
        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN") {
            return NextResponse.json({
                message: "Unauthorized! You are not an admin"
            }, { status: 403 });
        }

        const genreId = Number(params.genreId);
        if (isNaN(genreId)) {
            return NextResponse.json({
                message: "Invalid genreId"
            }, { status: 400 });
        }

        const body = await req.json();
        const { quizId, questionId } = body;

        if (!quizId || !questionId) {
            return NextResponse.json({
                message: "quizId and questionId are required"
            }, { status: 400 });
        }

        const quiz = await client.quiz.findUnique({
            where: { id: quizId }
        });

        if (!quiz || quiz.genreId !== genreId) {
            return NextResponse.json({
                message: "Quiz not found for the provided genre"
            }, { status: 404 });
        }

        const deleted = await client.question.delete({
            where: {
                ind: questionId
            }
        });

        return NextResponse.json({
            message: "Question deleted successfully",
            deleted
        });

    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);

        if (error.includes("ForeignKeyConstraint")) {
            return NextResponse.json({
                message: "Invalid reference: Genre or Quiz does not exist",
            }, { status: 400 });
        }
        return NextResponse.json({
            message: "Failed to delete question",
            details: error,
        }, { status: 500 });
    }
}
