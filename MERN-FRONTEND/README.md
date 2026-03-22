`npm install degit`

`degit https://github.com/benvanarragon/week9-comp2068W26`

`npm install`

BEFORE RUNNING NPM RUN DEV, WE HAVE TO BUILD, BUT WE ARE MISSING OUR
LOCAL .env.local file

=======

In the root directory, create a new file

`.env.local`

Inside of it add the following

`NEXT_PUBLIC_SERVER_URL=http://localhost:4000`
`NEXT_PUBLIC_CLIENT_URL=http://localhost:3000`

Then replace any reference in /app/sushi/page.tsx to

```tsx
const res: Response = await fetch(
  `${process.env.NEXT_PUBLIC_CLIENT_URL}/api/sushi`,
);
```

Replace any reference to localhost in /app/api/sushi/route.ts to this

```tsx
const res: Response = await fetch(
  `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sushi`,
);
```

===============

Now that we have replace the hard coded urls with env variables we can create a 'create' page and build a form

Make a new folder at

`/app/sushi/create` and a new file in the folder `page.tsx`

=======
BUILD A SIMPLE FORM

```tsx
export default function CreateSushi() {
  return (
    <main>
      <h1>Sushi Details</h1>
      <form>
        <fieldset>
          <label htmlFor="sushiName">Sushi Name: *</label>
          <input name="sushiName" id="sushiName" required />
        </fieldset>
        <fieldset>
          <label htmlFor="sushiPrice">Price: *</label>
          <input name="sushiPrice" id="sushiPrice" required />
        </fieldset>
        <button>Save</button>
      </form>
    </main>
  );
}
```

===========

INSIDE OF `/app/sushi/page.tsx` ADD A LINK TO THE CREATE FORM WE JUST MADE

```tsx
return (
    <main>
      <h1>Our Sushi</h1>
      <Link href="/sushi/create" className="linkButton">Add a New Sushi</Link>
      <ul>
```

=====

ADD CSS FROM BLACKBOARD FOR LINKBUTTON CLASS

====

ADD THE FOLLOWING CODE TO `app/api/sushi/route.ts`

```tsx
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
```

====

THEN IN `/api/sushi/create/page.tsx` ADD THE FOLLOWING

```TSX
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

```

==============
TEST YOUR NEW ROUTES AND BUTTONS
==============

NOW FOR THE DELETE ROUTE

==============

IN THE FILE `app/api/sushi/[id]/route.ts`

```tsx
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
```

============
NOW IN `/app/components/deleteSushiButton.tsx`
ADD THE FOLLOWING CODE

```tsx
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
```

============

NOW ON THE FILE `app/sushi/[id]/page.tsx` ADD THE FOLLOWING IMPORT

`import DeleteSushiButton from "@/app/components/deleteSushiButton";`

AND ADD THE FOLLOWING CODE AT THE END OF THE JSX RETURN INSIDE <ARTICLE>

`<DeleteSushiButton id={sushi._id} />`

==============
ADDING PUT / UPDATE FUNCTIONALITY

NOW INSIDE OF THE FOLLOWING FILE `app/api/sushi/[id]/route.ts`

ADD THE FOLLOWING CODE FOR UPDATE

```TSX

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
```

================
NOW WE NEED TO CREATE A NEW COMPONENT TO EDIT A SUSHI ITEM
=================

CREATE THE FOLLOWING FILE

`app/components/editSushiForm.tsx`

============

ADD THE FOLLOWING CODE TO THE COMPONENT, SAME AS DELETE PAGE

```TSX
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

```

============

NOW ON THE PAGE `app/sushi/[id]/page.tsx`

ADD THE FOLLOWING LINK TO EDIT A PAGE

`import Link from "next/link";`
`<Link href={`/sushi/edit/${sushi.\_id}`} className="linkButton">Edit</Link>`

==============

NOW CREATE A NEW FILE THAT WILL HOLD THE FORM COMPONENT WE CREATED EARLIER

`app/sushi/edit/[id]/page.tsx`

===========

ADD THE FOLLOWING CODE TO THE PAGE.

========

```TSX
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

```
