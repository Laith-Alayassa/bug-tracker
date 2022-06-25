import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import moment from "moment";
import mongoose from "mongoose";
import path from "path";
import { User, Bug, bugSchema } from "./models/models.js";
import { password } from "./password.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

// setup
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get('/' , (req, res) => {
    res.send('test.js bb')
})


const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Example app listening on port ${port}`)
})