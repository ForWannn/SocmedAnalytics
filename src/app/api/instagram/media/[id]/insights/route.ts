
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
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
        const { id } = await context.params;

        if (!id || id.includes("/")) {
            return NextResponse.json(
                {
                    success: false,
                    message: "ID media tidak valid.",
                },
                { status: 400 }
            );
        }

        const insightsUrl = new URL(
            `https://graph.instagram.com/${encodeURIComponent(id)}/insights`
        );

        insightsUrl.searchParams.set(
            "metric",
            "reach,likes,comments,saved,shares,total_interactions"
        );
        insightsUrl.searchParams.set("access_token", accessToken);

        const response = await fetch(insightsUrl, {
            method: "GET",
            cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Instagram media insights error:", {
                status: response.status,
                message: data.error?.message ?? "Unknown error",
            });

            return NextResponse.json(
                {
                    success: false,
                    message:
                        data.error?.message ??
                        "Gagal mengambil Insights konten Instagram.",
                },
                { status: response.status }
            );
        }

        const insights = (data.data ?? []).map(
            (item: {
                name: string;
                title?: string;
                description?: string;
                values?: { value: number }[];
                total_value?: { value: number };
            }) => ({
                name: item.name,
                title: item.title ?? item.name,
                description: item.description ?? "",
                value:
                    item.total_value?.value ??
                    item.values?.[0]?.value ??
                    null,
            })
        );

        return NextResponse.json({
            success: true,
            mediaId: id,
            insights,
        });
    } catch (error) {
        console.error("Media insights request failed:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Tidak dapat menghubungi Instagram API.",
            },
            { status: 500 }
        );
    }
}
