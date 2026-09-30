// Expense Tracker API with MongoDB

const express = require("express");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

app.use(express.json());

// MongoDB Connection
mongoose
    .connect("mongodb://127.0.0.1:27017/expenseDB")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(error => console.log("Database Error:", error));

// Expense Schema
const expenseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Expense Model
const Expense = mongoose.model("Expense", expenseSchema);

// Home Route
app.get("/", (req, res) => {
    res.json({
        message: "Expense Tracker API is running"
    });
});

// GET - All Expenses
app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();

        res.json(expenses);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch expenses"
        });
    }
});

// POST - Add Expense
app.post("/expenses", async (req, res) => {
    try {
        const { title, category, amount } = req.body;

        if (!title || !category || !amount) {
            return res.status(400).json({
                message: "Title, category and amount are required"
            });
        }

        const expense = new Expense({
            title,
            category,
            amount
        });

        await expense.save();

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add expense"
        });
    }
});

// PUT - Update Expense
app.put("/expenses/:id", async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.json({
            message: "Expense updated successfully",
            expense
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update expense"
        });
    }
});

// DELETE - Delete Expense
app.delete("/expenses/:id", async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(
            req.params.id
        );

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.json({
            message: "Expense deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete expense"
        });
    }
});

// GET - Total Expense
app.get("/expenses/total", async (req, res) => {
    try {
        const result = await Expense.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: "$amount"
                    }
                }
            }
        ]);

        const total = result.length > 0 ? result[0].total : 0;

        res.json({
            totalExpense: total
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to calculate total"
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
