import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(request, "admin");

    return NextResponse.json(
      {
        success: true,
        message: "Admin access granted",
        user,
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

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Admin access required",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}