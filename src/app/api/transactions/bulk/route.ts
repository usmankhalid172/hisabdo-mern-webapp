import { NextRequest } from "next/server";
import { handleBulkDelete } from "../bulk-delete-handler";

export async function DELETE(request: NextRequest) {
  return handleBulkDelete(request);
}

export async function POST(request: NextRequest) {
  return handleBulkDelete(request);
}

