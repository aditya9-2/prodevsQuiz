import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { attemptId: string } }
) {
    try {
        const attemptId = Number(params.attemptId);
        if (isNaN(attemptId)) {
            return NextResponse.json({ message: "Invalid attemptId" }, { status: 400 });
        }

        const attempt = await client.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                quiz: {
                    select: {
                        id: true,
                        title: true,
                        genre: { select: { id: true, title: true } },
                        Question: true
                    }
                },
                AttemptAnswer: {
                    include: {
                        question: true
                    }
                }
            }
        });

        if (!attempt) {
            return NextResponse.json({ message: "Attempt not found" }, { status: 404 });
        }

        const result = attempt.AttemptAnswer.map((ans) => {
            const correctAnswer = ans.question.correctAnswer;
            return {
                questionId: ans.questionId,
                questiontext: ans.question.questiontext,
                options: ans.question.options,
                selectedAnswer: ans.selectedAnswer,
                correctAnswer,
                isCorrect: ans.selectedAnswer === correctAnswer
            };
        });

        return NextResponse.json({
            message: "Attempt details fetched successfully",
            quiz: {
                id: attempt.quiz.id,
                title: attempt.quiz.title,
                genre: attempt.quiz.genre
            },
            score: attempt.score,
            result
        });

    } catch (err) {
        return NextResponse.json({
            message: "Failed to fetch attempt details",
            details: err instanceof Error ? err.message : String(err)
        }, { status: 500 });
    }
}
