import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/server-auth";

// UPDATE transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: params.id,
        user: user.id,
      },
      {
        type,
        amount: Number(amount),
        description,
        date: date || new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaction updated successfully",
        transaction,
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

    console.error("PUT transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update transaction",
      },
      { status: 500 }
    );
  }
}

// DELETE transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await requireAuth(request);

    const transaction = await Transaction.findOneAndDelete({
      _id: params.id,
      user: user.id,
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Transaction deleted successfully",
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

    console.error("DELETE transaction error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete transaction",
      },
      { status: 500 }
    );
  }
}