
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
        const mediaUrl = new URL(
            "https://graph.instagram.com/me/media"
        );

        mediaUrl.searchParams.set(
            "fields",
            "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp"
        );
        mediaUrl.searchParams.set("limit", "25");
        mediaUrl.searchParams.set("access_token", accessToken);

        const response = await fetch(mediaUrl, {
            method: "GET",
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Instagram media API error:", {
                status: response.status,
                message: data.error?.message ?? "Unknown error",
            });

            return NextResponse.json(
                {
                    success: false,
                    message:
                        data.error?.message ??
                        "Gagal mengambil konten Instagram.",
                },
                { status: response.status }
            );
        }

        const media = (data.data ?? []).map(
            (item: {
                id: string;
                caption?: string;
                media_type?: string;
                media_url?: string;
                thumbnail_url?: string;
                permalink?: string;
                timestamp?: string;
            }) => ({
                id: item.id,
                caption: item.caption ?? "",
                mediaType: item.media_type ?? "UNKNOWN",
                mediaUrl: item.media_url ?? null,
                thumbnailUrl:
                    item.thumbnail_url ?? item.media_url ?? null,
                permalink: item.permalink ?? null,
                timestamp: item.timestamp ?? null,
            })
        );

        return NextResponse.json({
            success: true,
            media,
            count: media.length,
            nextPageAvailable: Boolean(data.paging?.next),
        });
    } catch (error) {
        console.error("Instagram media request failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Tidak dapat menghubungi Instagram API.",
            },
            { status: 500 }
        );
    }
}
