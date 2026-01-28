import { NextResponse, NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const formData = await req.formData();
  const file = formData.get("file");
  const userId = formData.get("userId");

  const apiUrl = `https://api.clerk.com/v1/users/${userId}/profile_image`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
    body: formData,
  })
    .then((res) => res.json())
    .catch((err) => console.error(err));

  if (!response.ok) {
    return NextResponse.json(
      { error: "File upload failed" },
      { status: response.status },
    );
  }

  return NextResponse.json({ message: "File uploaded successfully" });
};
