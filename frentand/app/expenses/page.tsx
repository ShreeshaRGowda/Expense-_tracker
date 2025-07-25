"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Search, Filter } from "lucide-react"

const categoryColors: Record<string, string> = {
  Food: "bg-blue-100 text-blue-800",
  Transport: "bg-green-100 text-green-800",
  Entertainment: "bg-yellow-100 text-yellow-800",
  Shopping: "bg-red-100 text-red-800",
  Bills: "bg-purple-100 text-purple-800",
  Other: "bg-gray-100 text-gray-800",
}

export default function ViewExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("http://localhost:5000/list")
        if (!res.ok) throw new Error("Failed to fetch expenses")
        const data = await res.json()
        setExpenses(data)
      } catch (err: any) {
        setError(err.message || "Error loading expenses")
      } finally {
        setLoading(false)
      }
    }
    fetchExpenses()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    setError(null)
    try {
      const res = await fetch(`http://localhost:5000/delete/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to delete expense.")
      } else {
        setExpenses((prev) => prev.filter((expense) => expense.id !== id))
      }
    } catch (err: any) {
      setError("Network error. Please try again.")
    } finally {
      setDeletingId(null)
    }
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Expenses</h1>
          <p className="text-gray-600 mt-1">Manage and review all your expense entries.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <p className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">${totalAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white shadow-sm border-0 shadow-gray-100">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="bg-white shadow-sm border-0 shadow-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Expenses ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading expenses...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200">
                    <TableHead className="font-semibold text-gray-700">Title</TableHead>
                    <TableHead className="font-semibold text-gray-700">Amount</TableHead>
                    <TableHead className="font-semibold text-gray-700">Category</TableHead>
                    <TableHead className="font-semibold text-gray-700">Date</TableHead>
                    <TableHead className="font-semibold text-gray-700">Description</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="border-gray-100 hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">{expense.title}</TableCell>
                      <TableCell className="font-semibold text-red-600">-${Number(expense.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={categoryColors[expense.category] || categoryColors.Other}>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{expense.date}</TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent" disabled>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {!loading && !error && filteredExpenses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No expenses found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
