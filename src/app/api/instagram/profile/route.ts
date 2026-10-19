
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const accessToken =
        request.cookies.get("ig_access_token")?.value;

    if (!accessToken) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Token Instagram tidak ditemukan. Hubungkan akun terlebih dahulu.",
            },
            { status: 401 }
        );
    }

    try {
        const profileUrl = new URL(
            "https://graph.instagram.com/me"
        );

        profileUrl.searchParams.set(
            "fields",
            "user_id,username,account_type,media_count,followers_count"
        );

        profileUrl.searchParams.set("access_token", accessToken);

        const response = await fetch(profileUrl, {
            method: "GET",
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Instagram profile API error:", {
                status: response.status,
                message: data.error?.message ?? "Unknown error",
            });

            return NextResponse.json(
                {
                    success: false,
                    message:
                        data.error?.message ??
                        "Gagal mengambil profil Instagram.",
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            profile: {
                id: data.user_id,
                username: data.username,
                accountType: data.account_type,
                mediaCount: data.media_count,
                followersCount: data.followers_count,
            },
        });
    } catch (error) {
        console.error("Profile request failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Tidak dapat menghubungi Instagram API.",
            },
            { status: 500 }
        );
    }
}
