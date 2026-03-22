import Restaurant from "../components/restaurant";

export default function About() {
  return (
    <main>
      <h1>About this Site</h1>
      <p>We're building this site for COMP2068 in Winter 2026 - Georgian.</p>
      <section>
        <h2>Sushi Restaurants</h2>
        <Restaurant name="Sushi Chef" yearFounded={2000} />
        <Restaurant name="Diamond Sushi" yearFounded={1999} />
        <Restaurant name="SushiTime" yearFounded={2013} />
      </section>
    </main>
  );
}
