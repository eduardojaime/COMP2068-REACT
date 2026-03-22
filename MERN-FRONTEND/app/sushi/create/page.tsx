"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSushi() {
  // instantiate router for redirecting after successful save
  const router = useRouter();

  // state vars
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<string>("");

  // state var key/val dictionary of validation errors in form
  const [errors, setErrors] = useState<Record<string, string>>({});

  // form val
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // create new error key/val pair if title is empty
    if (!name.trim()) newErrors.sushiName = "Sushi Name is Required";
    if (!price.trim()) newErrors.sushiPrice = "Price is Required";

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
        `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi`,
        {
          method: "POST",
          headers: { "Content-Type": "applcation/json" },
          body: JSON.stringify({
            name,
            price,
          }),
        },
      );

      if (!res.ok) {
        alert("Failed to save sushi");
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
          <label htmlFor="name">Sushi Name: *</label>
          <input
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.title && <span className="error">{errors.name}</span>}
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
