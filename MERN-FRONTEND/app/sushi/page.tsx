import { Sushi } from "../types/sushi";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getSushi(): Promise<Sushi[]> {
  // use router to call server api
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi`,
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sushi");
  }

  // response is ok, so convert json to array of Game objects
  const sushi: Sushi[] = await res.json();
  console.log("DEBUG API DATA:", sushi); // <--- Add this!
  return sushi;
}

//Sushis has to be named something different otherwise there is a conflict with the @types import
export default async function Sushis() {
  // fetch data
  const sushi = await getSushi();

  return (
    <main>
      <h1>Our Sushi</h1>
      <Link href="/sushi/create" className="linkButton">
        Add a New Sushi
      </Link>
      <ul>
        {sushi.map((sushi) => (
          <li key={sushi._id} className="card">
            <h3>{"Roll: " + sushi.name}</h3>
            <br />
            <Link href={`/sushi/${sushi._id}`}>
              <button>View Details</button>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
