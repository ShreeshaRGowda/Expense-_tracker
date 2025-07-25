from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import os

# 🔐 Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# 📦 MongoDB setup
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["expense_tracker"]
collection = db["expenses"]

# ➕ Add a new expense
@app.route('/add', methods=['POST'])
def add_expense():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        # Validate required fields
        required_fields = ["title", "amount", "category", "date"]
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return jsonify({"error": f"Missing required field: {field}"}), 400
        # Convert amount to float
        try:
            data["amount"] = float(data["amount"])
        except ValueError:
            return jsonify({"error": "Amount must be a number"}), 400
        # Only include description if provided
        expense = {
            "title": data["title"],
            "amount": data["amount"],
            "category": data["category"],
            "date": data["date"],
        }
        if "description" in data and str(data["description"]).strip():
            expense["description"] = data["description"]
        result = collection.insert_one(expense)
        return jsonify({"message": "Expense added", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📄 List all expenses
@app.route('/list', methods=['GET'])
def list_expenses():
    try:
        expenses = list(collection.find({}, {"_id": 1, "title": 1, "amount": 1, "category": 1, "date": 1, "description": 1}))
        for expense in expenses:
            expense['id'] = str(expense.pop('_id'))
        return jsonify(expenses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ❌ Delete an expense
@app.route('/delete/<id>', methods=['DELETE'])
def delete_expense(id):
    try:
        result = collection.delete_one({"_id": ObjectId(id)})
        if result.deleted_count == 0:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"message": "Expense deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✏️ Update an expense
@app.route('/update/<id>', methods=['PUT'])
def update_expense(id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
        result = collection.update_one({"_id": ObjectId(id)}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"message": "Expense updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📊 Reports & Analytics endpoint
@app.route('/reports', methods=['GET'])
def get_reports():
    try:
        # Get period from query param (default: 6months)
        period = request.args.get('period', '6months')
        now = datetime.now()
        if period == '1month':
            start_date = now - timedelta(days=30)
        elif period == '3months':
            start_date = now - timedelta(days=90)
        elif period == '6months':
            start_date = now - timedelta(days=180)
        elif period == '1year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=180)

        # Fetch expenses in period
        expenses = list(collection.find({
            "date": {"$gte": start_date.strftime('%Y-%m-%d')}
        }, {"amount": 1, "category": 1, "date": 1}))

        # Monthly aggregation
        monthly = defaultdict(lambda: {"amount": 0, "budget": 1500})
        for exp in expenses:
            month = datetime.strptime(exp["date"], "%Y-%m-%d").strftime("%b")
            monthly[month]["amount"] += exp["amount"]
        # Sort months chronologically
        months_order = [
            (now - timedelta(days=30*i)).strftime("%b") for i in reversed(range(6))
        ]
        monthlyData = [
            {"month": m, "amount": monthly[m]["amount"], "budget": monthly[m]["budget"]}
            for m in months_order
        ]

        # Category aggregation
        category_totals = defaultdict(float)
        for exp in expenses:
            category_totals[exp["category"]] += exp["amount"]
        total_spent = sum(category_totals.values())
        categoryData = []
        colors = {
            "Food": "#3B82F6",
            "Transport": "#10B981",
            "Entertainment": "#F59E0B",
            "Shopping": "#EF4444",
            "Bills": "#8B5CF6",
            "Other": "#6B7280"
        }
        for cat, val in category_totals.items():
            percentage = round((val / total_spent) * 100, 2) if total_spent else 0
            categoryData.append({
                "name": cat,
                "value": val,
                "color": colors.get(cat, colors["Other"]),
                "percentage": percentage
            })
        categoryData.sort(key=lambda x: -x["value"])

        # Summary stats
        avg_monthly = round(sum(m["amount"] for m in monthlyData) / len(monthlyData), 2) if monthlyData else 0
        highest_month = max(monthlyData, key=lambda x: x["amount"], default={"month": "", "amount": 0})
        budget_variance = round(highest_month["amount"] - highest_month["budget"], 2)
        top_category = categoryData[0]["name"] if categoryData else ""
        top_category_pct = categoryData[0]["percentage"] if categoryData else 0

        summary = {
            "averageMonthly": avg_monthly,
            "highestMonth": {"month": highest_month["month"], "amount": highest_month["amount"]},
            "budgetVariance": budget_variance,
            "topCategory": {"name": top_category, "percentage": top_category_pct}
        }

        return jsonify({
            "monthlyData": monthlyData,
            "categoryData": categoryData,
            "summary": summary
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 📊 Dashboard endpoint
@app.route('/dashboard', methods=['GET'])
def dashboard():
    try:
        now = datetime.now()
        first_day_month = now.replace(day=1)
        first_day_last_month = (first_day_month - timedelta(days=1)).replace(day=1)
        first_day_week = now - timedelta(days=now.weekday())
        first_day_last_week = first_day_week - timedelta(days=7)
        monthly_budget = 2000  # You can adjust this value or fetch from user settings

        # Fetch all expenses
        expenses = list(collection.find({}, {"title": 1, "amount": 1, "category": 1, "date": 1, "description": 1, "_id": 1}))
        # Convert _id to string and use 'id' field
        for exp in expenses:
            exp["id"] = str(exp.get("_id", ""))
            exp.pop("_id", None)

        def safe_float(val):
            try:
                return float(val)
            except (ValueError, TypeError):
                return 0.0

        # Total spent (all time)
        total_spent = sum(safe_float(exp["amount"]) for exp in expenses)

        # This month spent
        this_month_spent = sum(
            safe_float(exp["amount"]) for exp in expenses
            if exp["date"] >= first_day_month.strftime('%Y-%m-%d')
        )
        # Last month spent
        last_month_spent = sum(
            safe_float(exp["amount"]) for exp in expenses
            if first_day_last_month.strftime('%Y-%m-%d') <= exp["date"] < first_day_month.strftime('%Y-%m-%d')
        )
        # Budget left
        budget_left = monthly_budget - this_month_spent

        # Transactions
        transactions = len(expenses)
        transactions_this_week = sum(
            1 for exp in expenses
            if exp["date"] >= first_day_week.strftime('%Y-%m-%d')
        )
        transactions_last_week = sum(
            1 for exp in expenses
            if first_day_last_week.strftime('%Y-%m-%d') <= exp["date"] < first_day_week.strftime('%Y-%m-%d')
        )

        # Percentage changes
        percent_change_month = round(((this_month_spent - last_month_spent) / last_month_spent * 100), 2) if last_month_spent else 0
        percent_change_week = round(((transactions_this_week - transactions_last_week) / transactions_last_week * 100), 2) if transactions_last_week else 0

        # Recent expenses (last 5)
        recent_expenses = sorted(expenses, key=lambda x: x["date"], reverse=True)[:5]
        # No need to convert _id again, already done above

        # Chart data (reuse /reports logic)
        # Monthly aggregation (last 6 months)
        monthly = defaultdict(lambda: {"amount": 0, "budget": monthly_budget})
        for exp in expenses:
            month = datetime.strptime(exp["date"], "%Y-%m-%d").strftime("%b")
            monthly[month]["amount"] += safe_float(exp["amount"])
        months_order = [
            (now - timedelta(days=30*i)).strftime("%b") for i in reversed(range(6))
        ]
        monthlyData = [
            {"month": m, "amount": monthly[m]["amount"], "budget": monthly[m]["budget"]}
            for m in months_order
        ]
        # Category aggregation
        category_totals = defaultdict(float)
        for exp in expenses:
            category_totals[exp["category"]] += safe_float(exp["amount"])
        total_spent_cat = sum(category_totals.values())
        categoryData = []
        colors = {
            "Food": "#3B82F6",
            "Transport": "#10B981",
            "Entertainment": "#F59E0B",
            "Shopping": "#EF4444",
            "Bills": "#8B5CF6",
            "Other": "#6B7280"
        }
        for cat, val in category_totals.items():
            percentage = round((val / total_spent_cat) * 100, 2) if total_spent_cat else 0
            categoryData.append({
                "name": cat,
                "value": val,
                "color": colors.get(cat, colors["Other"]),
                "percentage": percentage
            })
        categoryData.sort(key=lambda x: -x["value"])

        return jsonify({
            "totalSpent": total_spent,
            "thisMonthSpent": this_month_spent,
            "budgetLeft": budget_left,
            "transactions": transactions,
            "transactionsThisWeek": transactions_this_week,
            "percentChangeMonth": percent_change_month,
            "percentChangeWeek": percent_change_week,
            "recentExpenses": recent_expenses,
            "monthlyData": monthlyData,
            "categoryData": categoryData
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🚀 Run the app
if __name__ == '__main__':
    app.run(debug=True)
