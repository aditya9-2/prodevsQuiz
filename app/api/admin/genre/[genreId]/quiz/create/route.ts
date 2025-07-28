import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { genreId: string } }) {

    try {

        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN") {
            return NextResponse.json({
                message: "unauthorized! you are not an admin",
            }, { status: 403 });
        }

        const genreId = Number(await params.genreId);


        if (isNaN(genreId)) {
            return NextResponse.json({ message: "Invalid genreId" }, { status: 400 });
        }

        const genre = await client.genre.findUnique({ where: { id: genreId } });


        if (!genre) {
            return NextResponse.json({ message: "Genre not found" }, { status: 400 });
        }
        const body = await req.json();

        const { title, questions } = body;

        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({
                message: "Title and non-empty questions array are required",
            }, { status: 400 });
        }

        for (const q of questions) {

            if (!q.questiontext || !q.options || !Array.isArray(q.options) || q.options.length === 0 || !q.correctAnswer) {

                return NextResponse.json({
                    message: "Each question must have questiontext, non-empty options array, and correctAnswer",
                }, { status: 400 });
            }

            if (!q.options.includes(q.correctAnswer)) {
                return NextResponse.json({
                    message: "correctAnswer must be one of the options",
                }, { status: 400 });
            }
        }

        const quiz = await client.quiz.create({
            data: {
                title,
                genreId,
            },
        });

        const questionsQuery = await client.question.createMany({
            data: questions.map((question: any) => ({
                quizId: quiz.id,
                questiontext: question.questiontext,
                options: question.options,
                correctAnswer: question.correctAnswer,
            })),
        });

        if (questionsQuery.count !== questions.length) {
            return NextResponse.json({
                message: "Some questions could not be created",
            }, { status: 500 });
        }

        return NextResponse.json({
            message: "Quiz created successfully",
            quiz: {
                id: quiz.id,
                title: quiz.title,
                genreId: quiz.genreId,
                questionsCreated: questionsQuery.count,
            },
        }, { status: 201 });

    } catch (err) {

        const error = err instanceof Error ? err.message : String(err);

        if (error.includes("ForeignKeyConstraint")) {
            return NextResponse.json({
                message: "Invalid genreId: Genre does not exist",
            }, { status: 400 });
        }
        return NextResponse.json({
            message: "Failed to create quiz",
            details: error,
        }, { status: 500 });
    }
}