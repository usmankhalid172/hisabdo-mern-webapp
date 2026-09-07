import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { userStore } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in to access your account.",
        },
        { status: 401 }
      );
    }

    // Fetch full updated user profile from store
    const fullUser = await userStore.findById(authUser.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authUser.id,
          name: fullUser?.name || authUser.name,
          email: fullUser?.email || authUser.email,
          role: fullUser?.role || authUser.role,
          phone: fullUser?.phone || authUser.phone || "",
          shopName: fullUser?.shopName || authUser.shopName || "Merchant Store",
          createdAt: fullUser?.createdAt || new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error retrieving profile.",
      },
      { status: 500 }
    );
  }
}
