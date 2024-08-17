const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Moiddleware
app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://trendbuy-f057c.web.app",
      "https://trendbuy-f057c.firebaseapp.com",
    ],
    credentials: true,
  }));
app.use(express.json());

// console.log(process.env.DB_PASS,process.env.DB_USER)
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b9hcdyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b9hcdyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const productsCollection = client.db('TrendBuy').collection('products');

        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const result = await productsCollection.find().skip(page * size).limit(size).toArray();
            res.send(result);
        })

        app.get('/productsCount', async (req, res) => {
            const count = await productsCollection.estimatedDocumentCount();
            res.send({ count });
        })

        app.get('/sort/:sortItem', async (req, res) => {
            const sortItem = req.params.sortItem;
            console.log(sortItem)
            if (sortItem == 'lowPrice') {
                const cursor = productsCollection.find().sort({ price: 1 });
                const result = await cursor.toArray();
                res.send(result);
            }
            if (sortItem == 'highPrice') {
                const cursor = productsCollection.find().sort({ price: -1 });
                const result = await cursor.toArray();
                res.send(result);
            }
            const cursor = productsCollection.find().sort({ date: 1 });
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/search', async (req, res) => {
            const search = req.query.search
            console.log('see', search)
            const query = {
                title: { $regex: search, $options: 'i' }
            };
            const result = await productsCollection.find(query).toArray();
            res.send(result);

        })
        app.get('/filteredData', async (req, res) => {
            
            const result = await productsCollection.find().toArray();
            res.send(result);

        })
   

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('TrendBuy-server is running');
})

app.listen(port, () => {
    console.log(`TrendBuy is running on port:${port}`);
})
