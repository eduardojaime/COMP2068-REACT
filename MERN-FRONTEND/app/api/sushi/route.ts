// file used to make api calls to server at /api/sushi (GET and POST)
export async function GET() {
  // make get req to fetch all sushi from express api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
  );
  return Response.json(await res.json());
}

export async function POST(req: Request) {
  // read request body as json
  const body = await req.json();

  // call server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  // api call fails
  if (!res.ok) {
    const errorText = await res.text();
    console.log(`API POST Error: ${errorText}`);
    return new Response(errorText, { status: res.status });
  }

  // api call succeeds and returns only 201 created
  return Response.json({ success: true });
}
