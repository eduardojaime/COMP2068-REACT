"use client";

// state hook to persist a var on page re-render & track its value
import { useState } from "react";

export default function Home() {
  const [counter, setCounter] = useState<number>(0);
  return (
    <main>
      <h1>Sushi App</h1>
      <p>You've clicked the button {counter} times.</p>
      <button onClick={(e) => setCounter(counter + 1)}>Click Me</button>
      <button onClick={(e) => setCounter(0)}>Reset</button>
    </main>
  );
}
