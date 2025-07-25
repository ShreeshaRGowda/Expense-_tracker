"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react"
import { ExpenseChart } from "@/components/expense-chart"
import { CategoryChart } from "@/components/category-chart"
import { RecentExpenses } from "@/components/recent-expenses"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString())
    const fetchDashboard = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("http://127.0.0.1:5000/dashboard")
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || "Failed to fetch dashboard data")
        setData(json)
      } catch (err: any) {
        setError(err.message || "Error loading dashboard")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your expense overview.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-sm text-gray-500">Last updated: {lastUpdated}</p>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading dashboard...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border-0 shadow-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">${data?.totalSpent?.toFixed(2) ?? "0.00"}</div>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {data?.percentChangeMonth >= 0 ? `+${data.percentChangeMonth}%` : `${data.percentChangeMonth}%`} from last month
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0 shadow-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">${data?.thisMonthSpent?.toFixed(2) ?? "0.00"}</div>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  {data?.percentChangeMonth < 0 ? `${data.percentChangeMonth}%` : `-${data?.percentChangeMonth}%`} from last month
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0 shadow-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Budget Left</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">${data?.budgetLeft?.toFixed(2) ?? "0.00"}</div>
                <p className="text-xs text-gray-500 mt-1">{data?.thisMonthSpent && data?.budgetLeft ? `${((data.budgetLeft / (data.thisMonthSpent + data.budgetLeft)) * 100).toFixed(0)}% of monthly budget` : ""}</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0 shadow-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{data?.transactions ?? 0}</div>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {data?.percentChangeWeek >= 0 ? `+${data.percentChangeWeek}` : `${data.percentChangeWeek}`} this week
                </p>
              </CardContent>
            </Card>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExpenseChart data={data?.monthlyData ?? []} />
            <CategoryChart data={data?.categoryData ?? []} />
          </div>
          {/* Recent Expenses */}
          <RecentExpenses data={data?.recentExpenses ?? []} />
        </>
      )}
    </div>
  )
}
