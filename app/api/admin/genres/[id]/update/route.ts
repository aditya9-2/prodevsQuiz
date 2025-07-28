import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {

    try {

        const role = req.headers.get("x-user-role");


        if (role !== "ADMIN") {

            return NextResponse.json({
                message: "unauthorized! you are not an admin",

            }, { status: 403 })

        }

        const id = Number(params.id);

        if (isNaN(id)) {
            return NextResponse.json({
                message: "Invalid genre ID"
            }, { status: 400 });
        }
        const body = await req.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({
                message: "Title is required"
            }, { status: 400 });
        }

        const updatedGenre = await client.genre.update({
            where: { id },
            data: { title }
        });

        return NextResponse.json({
            message: "Genre updated successfully",
            genre: updatedGenre
        }, { status: 200 });

    } catch (err) {

        return NextResponse.json({
            message: "Unable to update genre",
            details: err instanceof Error ? err.message : err
        }, { status: 500 });

    }

}