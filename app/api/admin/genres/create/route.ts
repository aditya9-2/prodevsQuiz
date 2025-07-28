import { client } from "@/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    try {

        const user = await client.user.findUnique({ where: { id: 6 } });
        console.log("User:", user);

        const body = await req.json();

        const { title } = body;

        if (!title) {
            return NextResponse.json({
                message: "Title is required"
            }, { status: 400 });
        }

        const role = req.headers.get("x-user-role");
        console.log(`role is: ${role}`)

        if (role !== "ADMIN") {
            return NextResponse.json({
                message: "unauthorized! you are not an admin"
            }, { status: 403 })
        }

        const adminIdHeader = req.headers.get("x-user-id");

        const adminId = adminIdHeader ? Number(adminIdHeader) : undefined;

        if (!adminId || isNaN(adminId)) {

            return NextResponse.json({
                message: "Invalid or missing admin ID"
            }, { status: 400 });
        }

        const newGenre = await client.genre.create({
            data: {
                title,
                adminId
            }
        });

        return NextResponse.json({
            message: "Genre created successfully",
            genre: newGenre
        }, { status: 201 })

    } catch (err) {

        return NextResponse.json({
            message: "Unable to create genre",
            details: err instanceof Error ? err.message : err
        }, { status: 500 })
    }
}