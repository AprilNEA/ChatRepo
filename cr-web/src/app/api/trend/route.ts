import { NextResponse } from "next/server";
import { getTrend } from "@/lib/get-trend";

export async function GET() {
	const lastWeek = new Date();
	lastWeek.setDate(lastWeek.getDate() - 7);
	const trendingRepos = await getTrend(lastWeek);

	return NextResponse.json(trendingRepos);
}
