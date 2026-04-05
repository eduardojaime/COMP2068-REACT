// file used to make api calls to server at /api/sushi (GET and POST)
import { cookies } from 'next/headers';

export async function GET() {
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  // make get req to fetch all sushi from express api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
    {
      credentials: "include", // Send auth cookie
      headers: {
        // Forward the cookie to the backend
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
    }
  );
  console.log(res);
  return Response.json(await res.json());
}

export async function POST(req: Request) {
  // Get cookies from the incoming request
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken');
  
  // read request body as json
  const body = await req.json();

  // call server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        // Forward the cookie to the backend
        ...(authToken && { Cookie: `authToken=${authToken.value}` }),
      },
      credentials: "include", // Send auth cookie
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
