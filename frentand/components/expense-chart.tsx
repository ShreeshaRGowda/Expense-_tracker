"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"

const data = [
	{ month: "Jan", amount: 1200 },
	{ month: "Feb", amount: 1800 },
	{ month: "Mar", amount: 1400 },
	{ month: "Apr", amount: 2200 },
	{ month: "May", amount: 1900 },
	{ month: "Jun", amount: 2400 },
]

const chartConfig = {
	amount: {
		label: "Amount",
		color: "hsl(var(--chart-1))",
	},
}

export function ExpenseChart({ data: propData }: { data?: any[] }) {
	const chartData = propData ?? data
	return (
		<Card className="bg-white shadow-sm border-0 shadow-gray-100">
			<CardHeader>
				<CardTitle className="text-lg font-semibold text-gray-900">
					Monthly Expenses
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData}>
							<XAxis
								dataKey="month"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6B7280" }}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: "#6B7280" }}
								tickFormatter={(value) => `$${value}`}
							/>
							<ChartTooltip content={<ChartTooltipContent />} />
							<Line
								type="monotone"
								dataKey="amount"
								stroke={chartConfig.amount.color}
								strokeWidth={2}
								dot={false}
							/>
						</LineChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
