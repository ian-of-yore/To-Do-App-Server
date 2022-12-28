const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.send('Server is up and running')
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.mmmt3qa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const database = client.db("ToDoApp");
        const tasksCollection = database.collection("tasks");

        // creating new tasks
        app.post('/tasks', async (req, res) => {
            const doc = req.body;
            const task = await tasksCollection.insertOne(doc);
            res.send(task);
        });

        // getting all the tasks for a specific user
        app.get('/tasks', async (req, res) => {
            const email = req.query.email;
            const query = { userEmail: email };
            const cursor = tasksCollection.find(query).sort({ "_id": -1 });
            const result = await cursor.toArray();
            res.send(result);
        });

        // getting all the available posts in the database
        app.get('/allTasks', async (req, res) => {
            const query = {};
            const cursor = tasksCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        // getting a single task based on task id
        app.get('/allTasks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await tasksCollection.findOne(filter);
            res.send(result)
        });

        // updating the task status
        app.patch('/allTasks:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: 'completed'
                }
            };
            const result = await tasksCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        });

        // delete a task
        app.delete('/allTasks:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await tasksCollection.deleteOne(filter);
            res.send(result)
        });

        // getting all the completed task of a specific user
        app.get('/completedTasks', async (req, res) => {
            const email = req.query.email;
            const filter = { userEmail: email, status: 'completed' };
            const cursor = tasksCollection.find(filter);
            const result = await cursor.toArray();
            res.send(result)
        });

        // setting not completed tag on tasks
        app.patch('/notCompleted:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: status
                }
            };
            const result = await tasksCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })


    }

    finally {

    }
}

run().catch(err => console.log(err))


app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})