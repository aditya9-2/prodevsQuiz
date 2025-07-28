import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

interface Answer {
    questionId: number;
    selectedAnswer: string;
}

export async function POST(
    req: NextRequest,
    { params }: { params: { quizId: string } }
) {
    try {

        const quizId = Number(params.quizId);

        if (isNaN(quizId)) {
            return NextResponse.json({ message: "Invalid quizId" }, { status: 400 });
        }

        const body = await req.json();
        const { userId, answers } = body;

        if (!userId || !Array.isArray(answers)) {
            return NextResponse.json({
                message: "userId and answers are required",
            }, { status: 400 });
        }

        const quiz = await client.quiz.findUnique({
            where: { id: quizId },
            include: { Question: true }
        });

        if (!quiz) {
            return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
        }

        let score = 0;
        const detailedResult = [];

        for (const answer of answers as Answer[]) {
            const question = quiz.Question.find(q => q.ind === answer.questionId);
            if (question) {
                const isCorrect = question.correctAnswer === answer.selectedAnswer;
                if (isCorrect) score += 2;

                detailedResult.push({
                    questionId: question.ind,
                    questiontext: question.questiontext,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: question.correctAnswer,
                    isCorrect
                });
            }
        }

        const attempt = await client.quizAttempt.create({
            data: {
                userId,
                quizId,
                score,
                AttemptAnswer: {
                    create: detailedResult.map(ans => ({
                        questionId: ans.questionId,
                        selectedAnswer: ans.selectedAnswer
                    }))
                }
            }
        });

        return NextResponse.json({
            message: "Quiz attempted successfully",
            score,
            attemptId: attempt.id,
            result: detailedResult
        });

    } catch (err) {
        return NextResponse.json({
            message: "Failed to submit quiz attempt",
            details: err instanceof Error ? err.message : String(err)
        }, { status: 500 });
    }
}
