"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const data = [
	{ name: "Food", value: 850, color: "#3B82F6" },
	{ name: "Transport", value: 420, color: "#10B981" },
	{ name: "Entertainment", value: 380, color: "#F59E0B" },
	{ name: "Shopping", value: 290, color: "#EF4444" },
	{ name: "Bills", value: 650, color: "#8B5CF6" },
	{ name: "Other", value: 257, color: "#6B7280" },
]

const chartConfig = {
	value: {
		label: "Amount",
	},
}

export function CategoryChart({ data: propData }: { data?: any[] }) {
	const chartData = propData ?? data
	return (
		<Card className="bg-white shadow-sm border-0 shadow-gray-100">
			<CardHeader>
				<CardTitle className="text-lg font-semibold text-gray-900">
					Expenses by Category
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[300px]">
					<ResponsiveContainer width="100%" height="100%">
						<PieChart>
							<Pie
								data={chartData}
								cx="50%"
								cy="50%"
								innerRadius={60}
								outerRadius={100}
								paddingAngle={2}
								dataKey="value"
							>
								{chartData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<ChartTooltip
								content={<ChartTooltipContent />}
								formatter={(value) => [`$${value}`, "Amount"]}
							/>
						</PieChart>
					</ResponsiveContainer>
				</ChartContainer>
			</CardContent>
		</Card>
	)
}
