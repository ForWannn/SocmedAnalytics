
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("ig_access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Instagram belum terhubung. Silakan login kembali.",
                },
                { status: 401 }
            );
        }


        const params = new URLSearchParams({
            metric: "reach,views,total_interactions,accounts_engaged",
            period: "day",
            metric_type: "total_value",
            access_token: accessToken,
        });


        const response = await fetch(
            `https://graph.instagram.com/me/insights?${params.toString()}`,
            { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || result.error) {
            console.error("Instagram Insights API error:", result.error);

            return NextResponse.json(
                {
                    success: false,
                    message:
                        result.error?.message ??
                        "Gagal mengambil data Instagram Insights.",
                },
                { status: response.status || 502 }
            );
        }

        const metrics = Object.fromEntries(
            (result.data ?? []).map((item: {
                name: string;
                total_value?: { value?: number };
                values?: Array<{ value?: number }>;
            }) => [
                    item.name,
                    item.total_value?.value ??
                    item.values?.[0]?.value ??
                    null,
                ])
        );

        return NextResponse.json({
            success: true,
            period: "last_30_days",
            metrics,
        });
    } catch (error) {
        console.error("Insights route error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan saat mengambil Insights.",
            },
            { status: 500 }
        );
    }
}
