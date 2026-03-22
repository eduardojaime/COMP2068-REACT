import express from "express";
import sushiRouter from "./routes/sushi.routes.js";
import { connectToDatabase } from "./services/database.service.js";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const port = 4000;

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Sushi API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//middleware
// 'dev' gives a color-coded output: :method :url :status :response-time ms
app.use(morgan("dev"));

// Middleware: lets us read JSON bodies
app.use(express.json());

connectToDatabase()
  .then(() => {
    app.use("/api/sushi", sushiRouter);

    app.listen(port, () => {
      console.log(`Server started at http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit();
  });

// mount sushi routes
//app.use("/api/sushi", sushiRouter);

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });
