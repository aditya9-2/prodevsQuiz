import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    try {

        const role = req.headers.get("x-user-role");

        if (role !== "ADMIN") {
            return NextResponse.json({
                message: "unauthorized! You are not an admin"
            }, { status: 403 })
        }

        const id = Number(params.id);

        if (!id || isNaN(id)) {
            return NextResponse.json({
                message: "id not provided or id is not a number"
            }, { status: 400 })
        }

        await client.genre.delete({
            where: {
                id
            }
        });

        return NextResponse.json({
            message: "Genre Deleted Successfully"
        }, { status: 200 });

    } catch (err) {
        return NextResponse.json({
            message: "failed to delete genre",
            details: err instanceof Error ? err.message : err
        }, { status: 500 })

    }

}