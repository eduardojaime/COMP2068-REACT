"use client";

import { useRouter } from "next/navigation";

// component takes id prop so we can pass to api delete fn
export default function DeleteSushiButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sushi?")) {
      return;
    } else {
      // call api here
      const res: Response = await fetch(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) {
        alert("Failed to delete sushi");
      }

      router.push("/sushi");
    }
  };

  return (
    <button onClick={handleDelete} className="delete">
      Delete
    </button>
  );
}
