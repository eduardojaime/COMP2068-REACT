import { ObjectId } from "mongodb"; //allows us to have an id value from mongodo

export default interface Sushi {
  //now an interface, instead of type
  _id?: ObjectId; // optional because MongoDB adds it
  name: string;
  price: number;
}
