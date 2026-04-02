import { Router, type Request, type Response } from "express";

import { ObjectId } from "mongodb";
import { collections } from "../services/database.service.js";
import type Sushi from "../models/sushi.js";
 
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

/**
 * @openapi
 * /api/sushi:
 *   get:
 *     summary: Get all sushi
 *     responses:
 *       200:
 *         description: List of sushi
 */
// GET all sushi
// router.get("/", (req: Request, res: Response) => {
//   res.status(200).json(sushiMenu);
// });
// PATH + MIDDLEWARES (LIST)
// Protect routes individually
// router.get("/", verifyToken, async (_req: Request, res: Response) => {
router.get("/", async (_req: Request, res: Response) => {
  try {
    if (!collections.sushiMenu) {
      return res.status(500).send("Collection not initialized");
    }
    const sushiMenu = (await collections.sushiMenu
      .find({})
      .toArray()) as Sushi[];

    res.status(200).send(sushiMenu);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send(String(error));
    }
  }
});

/**
 * @openapi
 * /api/sushi/{id}:
 *   get:
 *     summary: Get sushi by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: sushi ID
 *     responses:
 *       200:
 *         description: Sushi item
 *       404:
 *         description: Not found
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req?.params?.id;

    // Cast 'id' to string so ObjectId/findOne accepts it
    const query = { _id: new ObjectId(id as string) };

    // Express types `req.params` as string | undefined
    if (!id) {
      return res.status(400).send("ID is required");
    }

    if (!collections.sushiMenu) {
      return res.status(500).send("Collection not initialized");
    }
    const game = (await collections.sushiMenu.findOne(query)) as Sushi;

    if (game) {
      res.status(200).send(game);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send(String(error));
    }
  }
});

// GET single sushi
// router.get("/:id", (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const sushi = sushiMenu.find((item) => item.id === id);

//   if (!sushi) {
//     return res.status(404).json({ error: "Sushi not found" });
//   }

//   res.status(200).json(sushi);
// });

/**
 * @openapi
 * /api/sushi:
 *   post:
 *     summary: Create a new sushi item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Created
 */
// POST new sushi
// router.post("/", (req: Request, res: Response) => {
//   const { name, price } = req.body;

//   if (!name || price === undefined) {
//     return res.status(400).json({
//       error: "Name and price are required",
//     });
//   }

//   const newSushi: Sushi = {
//     id: sushiMenu.length + 1,
//     name,
//     price,
//   };

//   sushiMenu.push(newSushi);

//   res.status(201).json(newSushi);
// });
router.post("/", async (req: Request, res: Response) => {
  try {
    const newSushi = req.body as Sushi;
    if (!collections.sushiMenu) {
      return res.status(500).send("Collection not initialized");
    }
    const result = await collections.sushiMenu.insertOne(newSushi);

    result
      ? res
          .status(201)
          .json({
            message: `Successfully created a new sushi with id ${result.insertedId}`,
          })
      : res.status(500).send("Failed to create a new sushi.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send(String(error));
    }
  }
});

/**
 * @openapi
 * /api/sushi/{id}:
 *   put:
 *     summary: Update a sushi item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 */
// PUT update sushi
// router.put("/:id", (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const { name, price } = req.body;

//   const sushi = sushiMenu.find((item) => item.id === id);

//   if (!sushi) {
//     return res.status(404).json({ error: "Sushi not found" });
//   }

//   if (name !== undefined) sushi.name = name;
//   if (price !== undefined) sushi.price = price;

//   res.status(200).json(sushi);
// });

router.put("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const updatedGame: Sushi = req.body as Sushi;
    // Cast 'id' to string so ObjectId/findOne accepts it
    const query = { _id: new ObjectId(id as string) };

    if (!collections.sushiMenu) {
      return res.status(500).send("Collection not initialized");
    }
    const result = await collections.sushiMenu.updateOne(query, {
      $set: updatedGame,
    });

    result
      ? res.status(200).send(`Successfully updated sushi with id ${id}`)
      : res.status(304).send(`Sushi with id: ${id} not updated`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send(String(error));
    }
  }
});

/**
 * @openapi
 * /api/sushi/{id}:
 *   delete:
 *     summary: Delete a sushi item
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Not found
 */
// DELETE sushi
// router.delete("/:id", (req: Request, res: Response) => {
//   const id = Number(req.params.id);
//   const index = sushiMenu.findIndex((item) => item.id === id);

//   if (index === -1) {
//     return res.status(404).json({ error: "Sushi not found" });
//   }

//   sushiMenu.splice(index, 1);

//   res.status(204).send();
// });

router.delete("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    // Cast 'id' to string so ObjectId/findOne accepts it
    const query = { _id: new ObjectId(id as string) };

    if (!collections.sushiMenu) {
      return res.status(500).send("Collection not initialized");
    }
    const result = await collections.sushiMenu.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed sushi with id ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove sushi with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Sushi with id ${id} does not exist`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).send(error.message);
    } else {
      res.status(500).send(String(error));
    }
  }
});
export default router;
