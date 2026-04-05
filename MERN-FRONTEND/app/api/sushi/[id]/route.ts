// GET: /api/sushi/:id => fetch single sushi
import { cookies } from 'next/headers';

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
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  // read id from url params
  const { id } = await params;

  // call delete with id on server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi/${id}`,
    { 
      method: "DELETE",
      headers: {
        // Forward the cookie to the backend
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include", // Send auth cookie
    },
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
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
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
      headers: { "Content-Type": "application/json",
        // Forward the cookie to the backend
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include", // Send auth cookie
      body: JSON.stringify(body),
    },
  );

  // error handle
  if (!res.ok) throw new Error("Failed to update sushi");
  return new Response(null, { status: 204 });
}
