// POST: /api/sushi => create new sushi
export async function POST(req: Request) {
  try {
    // 1. Read the data sent from the frontend form
    const body = await req.json();

    // 2. Call your Express server API
    const res: Response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    // 3. Error handle
    if (!res.ok) {
      return Response.json(
        { message: "Failed to create sushi on server" },
        { status: res.status },
      );
    }

    // 4. Return the server's response back to the frontend
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    console.error("Route Error:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
