"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, DollarSign } from "lucide-react"

const categories = ["Food", "Transport", "Entertainment", "Shopping", "Bills", "Healthcare", "Education", "Other"]

export default function AddExpense() {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch("http://127.0.0.1:5000/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to add expense.")
      } else {
        setMessage("Expense added successfully!")
        setFormData({
          title: "",
          amount: "",
          category: "",
          date: "",
          description: "",
        })
      }
    } catch (err: any) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-gray-600 mt-1">Track your spending by adding a new expense entry.</p>
      </div>

      {/* Form */}
      <Card className="bg-white shadow-sm border-0 shadow-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Expense Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., Grocery shopping, Gas, Coffee"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full"
                required
              />
            </div>

            {/* Amount and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                  Category *
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date *
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional notes about this expense..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Adding..." : "Add Expense"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormData({
                    title: "",
                    amount: "",
                    category: "",
                    date: "",
                    description: "",
                  })
                }
                disabled={loading}
              >
                Clear
              </Button>
            </div>
            {message && <div className="text-green-600 text-sm pt-2">{message}</div>}
            {error && <div className="text-red-600 text-sm pt-2">{error}</div>}
          </form>
        </CardContent>
      </Card>

      {/* Quick Add Suggestions */}
      <Card className="bg-white shadow-sm border-0 shadow-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Add</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { title: "Coffee", amount: "5.00", category: "Food" },
              { title: "Lunch", amount: "15.00", category: "Food" },
              { title: "Gas", amount: "50.00", category: "Transport" },
              { title: "Parking", amount: "10.00", category: "Transport" },
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start bg-transparent"
                onClick={() =>
                  setFormData({
                    ...formData,
                    title: suggestion.title,
                    amount: suggestion.amount,
                    category: suggestion.category,
                    date: new Date().toISOString().split("T")[0],
                  })
                }
              >
                <span className="font-medium">{suggestion.title}</span>
                <span className="text-sm text-gray-500">${suggestion.amount}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
