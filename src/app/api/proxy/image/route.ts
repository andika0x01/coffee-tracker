import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      next: { revalidate: 31536000 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const contentType = response.headers.get("content-type");
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}
