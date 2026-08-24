import { NextRequest, NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/server-auth";

// GET all transactions
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(request);

    const transactions = await Transaction.find({
      user: user.id,
    }).sort({ date: -1 });

    return NextResponse.json(
      {
        success: true,
        transactions,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("GET transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}

// CREATE a transaction
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = await requireAuth(request);

    const body = await request.json();

    const { type, amount, description, date } = body;

    if (!type || amount === undefined || !description) {
      return NextResponse.json(
        {
          success: false,
          message: "Type, amount and description are required",
        },
        { status: 400 }
      );
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Type must be income or expense",
        },
        { status: 400 }
      );
    }

    if (Number(amount) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount cannot be negative",
        },
        { status: 400 }
      );
    }

    const transaction = await Transaction.create({
      user: user.id,
      type,
      amount: Number(amount),
      description,
      date: date || new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    console.error("POST transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create transaction",
      },
      { status: 500 }
    );
  }
}