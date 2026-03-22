import { Sushi } from "../../../types/sushi";
import EditSushiForm from "../../../components/editSushiForm";

export default async function EditSushiPage({
  params,
}: {
  params: { id: string };
}) {
  // read if from url param
  const { id } = await params;

  // fetch sushi
  const res: Response = await fetch(
    `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi/${id}`,
  );

  if (!res.ok) return <div>Sushi not found</div>;

  // populate sushi from api response
  const sushi: Sushi = await res.json();

  return (
    <main>
      <EditSushiForm sushi={sushi} />
    </main>
  );
}
