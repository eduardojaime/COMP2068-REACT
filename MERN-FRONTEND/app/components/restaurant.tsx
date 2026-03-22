type RestaurantProps = {
  name: string;
  yearFounded: number;
};

// props act as input params whenver this component is rendered
export default function Restaurant({ name, yearFounded }: RestaurantProps) {
  return (
    <article className="card">
      <h1>{name}</h1>
      <p>Founded: {yearFounded}</p>
    </article>
  );
}
