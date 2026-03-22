// GET: /api/sushi/:id => fetch single sushi
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // read id from url params
  const { id } = await params;

  // call get with id on server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
  );

  // error handle
  if (!res.ok) throw new Error("Failed to fetch sushi");

  // return sushi in json
  return Response.json(await res.json());
}

// DELETE: /api/sushi/:id => delete selected sushi
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // read id from url params
  const { id } = await params;

  // call delete with id on server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
    { method: "DELETE" },
  );

  // error handle
  if (!res.ok) throw new Error("Failed to delete sushi");

  return new Response(null, { status: 204 });
}

// PUT: /api/sushi/:id => update selected sushi
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // read id from url params
  const { id } = await params;

  // get request body
  //You must await req.json() to get the actual data!
  const body = await req.json();

  // call update with id on server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  // error handle
  if (!res.ok) throw new Error("Failed to update sushi");
  return new Response(null, { status: 204 });
}
