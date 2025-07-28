import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {

        const genres = await client.genre.findMany({
            select: {
                id: true,
                title: true
            }
        });

        if (genres.length === 0) {
            return NextResponse.json({
                message: "No genres found"
            }, { status: 404 });
        }

        return NextResponse.json({
            message: "Genres retrieved successfully",
            genres
        }, { status: 200 });

    } catch (err) {

        return NextResponse.json({
            message: "Unable to get genres",
            details: err instanceof Error ? err.message : err
        }, { status: 500 });
    }
}
