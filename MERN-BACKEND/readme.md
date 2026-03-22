**https://www.mongodb.com/resources/products/compatibilities/using-typescript-with-mongodb-tutorial#setting-up-your-project**

clone my code from last week, but degit downloads the latest version of a repo as a tarball and extracts it, without the .git folder.

`npx degit https://github.com/benvanarragon/comp2068_w26_week5`

**IMPORTANT - if you haven't already - CD INTO YOUR APP -> demo**
`cd demo`

**Run an install to install all node packages and libraries**
`npm install`

**WE NEED TO COPY OUR .ENV FILE OVER FROM LAST WEEK, SINCE IT WAS NOT UPLOADED TO GIT**
-> CREATE `.env` and add your credentials for your MongoDB cluster

DB_CONN_STRING=mongodb+srv://username:password@benscluster.lh9npfd.mongodb.net/?appName=BensCluster
DB_NAME=myFirstDatabase
COLLECTION_NAME=sushiMenu

**Run your app for development**
`npm run dev`

**go to http://localhost:3000/api/sushi**

**STEP 1 - Add PUT Route for updates to Sushi**

Inside of `/src/routes/sushi.routes.ts`

The PUT method is used when requesting an update to an existing document. Paste the code under the ‘PUT’ heading:

```ts
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
```

This is very similar to the POST method above. However, we also have the ‘:id’ request parameter you learned about in GET.

Like with the findOne function, updateOne takes a query as the first argument. The second argument is another object, in this case, the update filter. Because we have a whole object and we don’t need to care what is new or not, we pass in ‘$set’ which is a property that adds or updates all fields in the document.

Instead of passing a 500 error if it fails this time, however, we pass 304, which means not modified to reflect that the document hasn’t changed.

Although we don’t use it here as the default settings are fine, the function takes an optional third argument which is an object of optional parameters. One example is upsert, which if set to true, will create a new document if it doesn’t exist when being requested to be updated. You can read more about updateOne and optional arguments in our documentation.

**ADDING A DELETE METHOD**

inside of `sushi.routes.ts` add the following code

```ts
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
```

Nothing much different to earlier functions such as read is happening here. We create a query from the id and pass that query to the deleteOne function. See our reference documentation to learn more about deleting multiple documents.

If it was able to be deleted, a 202 status is returned. 202 means accepted as we only know it accepted the deletion. Otherwise we return 400 if it wasn't deleted, or 404 if the document couldn't be found.

**Install LOGGING software**
Morgan for Logging

We often struggle to know if their requests are hitting the server or why they are failing. Adding a logger gives instant feedback in the terminal.

Why: It makes the "invisible" network traffic visible.

Takeaway: Understanding HTTP status codes (200s vs 400s vs 500s) as they happen in real-time.

`npm install morgan`
`npm install --save-dev @types/morgan`

Add the following to your `index.ts`
//at the top of your file
`import morgan from 'morgan';`

//middleware
// 'dev' gives a color-coded output: :method :url :status :response-time ms

app.use(morgan('dev'));

**Make a few Postman Requests / view morgan logging in console**
