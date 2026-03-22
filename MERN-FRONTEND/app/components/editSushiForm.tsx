"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sushi } from "../types/sushi";

// edit form should be pre-filled so it accepts a Sushi prop
export default function EditSushiForm({ sushi }: { sushi: Sushi }) {
  // instantiate router for redirecting after successful save
  const router = useRouter();

  // state vars.  populate from Sushi prop pass to component
  const [name, setName] = useState<string>(sushi.name || "");
  const [price, setPrice] = useState<string>(sushi.price?.toString() || "");

  // state var key/val dictionary of validation errors in form
  const [errors, setErrors] = useState<Record<string, string>>({});

  // form val
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // create new error key/val pair if title is empty
    if (!name.trim()) newErrors.title = "Name is Required";
    if (!price.trim()) newErrors.developer = "Price is Required";

    // update error state dict
    setErrors(newErrors);

    // no new errors in dict
    if (Object.keys(newErrors).length === 0) {
      return true;
    } else {
      return false;
    }
  };

  // submit
  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    // disable form's default behaviour; we'll use TS to process instead
    e.preventDefault();

    if (!validate()) {
      return;
    } else {
      // call route which calls api
      const res: Response = await fetch(
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi/${sushi._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            price: price ? parseFloat(price) : null,
          }),
        },
      );

      if (!res.ok) {
        alert("Failed to update sushi");
      }

      // ok, refresh sushi list
      router.push("/sushi");
    }
  };

  return (
    <main>
      <h1>Sushi Details</h1>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label htmlFor="sushi">Sushi: *</label>
          <input
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </fieldset>

        <fieldset>
          <label htmlFor="price">Price:</label>
          <input
            name="price"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.1"
          />
        </fieldset>
        <button>Save</button>
      </form>
    </main>
  );
}
