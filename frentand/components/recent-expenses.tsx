import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const recentExpenses = [
  { id: 1, title: "Grocery Shopping", amount: 85.5, category: "Food", date: "2024-01-15", type: "expense" },
  { id: 2, title: "Gas Station", amount: 45.0, category: "Transport", date: "2024-01-14", type: "expense" },
  {
    id: 3,
    title: "Netflix Subscription",
    amount: 15.99,
    category: "Entertainment",
    date: "2024-01-13",
    type: "expense",
  },
  { id: 4, title: "Coffee Shop", amount: 12.5, category: "Food", date: "2024-01-12", type: "expense" },
  { id: 5, title: "Uber Ride", amount: 18.75, category: "Transport", date: "2024-01-11", type: "expense" },
]

const categoryColors: Record<string, string> = {
  Food: "bg-blue-100 text-blue-800",
  Transport: "bg-green-100 text-green-800",
  Entertainment: "bg-yellow-100 text-yellow-800",
  Shopping: "bg-red-100 text-red-800",
  Bills: "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
}

export function RecentExpenses({ data: propData }: { data?: any[] }) {
  const expenses = propData ?? recentExpenses
  return (
    <Card className="bg-white shadow-sm border-0 shadow-gray-100">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">{expense.title}</p>
                    <p className="text-xs text-gray-500">{expense.date}</p>
                  </div>
                  <Badge className={categoryColors[expense.category] || categoryColors.Other}>
                    {expense.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right font-semibold text-red-600">-${Number(expense.amount).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
