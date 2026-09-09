import { NextResponse } from "next/server";
import store from "@/lib/db-store";

export async function GET() {
  try {
    const stats = await store.getOverallStats();

    const customers = store.customers.map((customer) => ({
      _id: customer._id,
      name: customer.name,
      city: customer.city,
      category: customer.category,
      creditLimit: customer.creditLimit,
      initialBalance: customer.initialBalance,
      netBalance: customer.netBalance,
      status: customer.status,
      paymentTermsDays: customer.paymentTermsDays,
    }));

    const vendors = store.vendors.map((vendor) => ({
      _id: vendor._id,
      name: vendor.name,
      companyName: vendor.companyName,
      city: vendor.city,
      category: vendor.category,
      initialBalance: vendor.initialBalance,
      payableBalance: vendor.payableBalance,
      status: vendor.status,
      paymentTermsDays: vendor.paymentTermsDays,
    }));

    const transactions = store.transactions.map((transaction) => ({
      _id: transaction._id,
      partyType: transaction.partyType,
      customerId: transaction.customerId,
      vendorId: transaction.vendorId,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date,
      paymentMethod: transaction.paymentMethod,
      billNumber: transaction.billNumber,
      description: transaction.description,
      balanceAfter: transaction.balanceAfter,
      createdAt: transaction.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: stats,
        customers,
        vendors,
        transactions,
      },
    });
  } catch (error) {
    console.error("Reports API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate report data",
      },
      { status: 500 }
    );
  }
} 
