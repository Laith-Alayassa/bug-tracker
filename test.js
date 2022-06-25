import express from "express";
const port = process.env.PORT
import bodyParser from "body-parser";
import path from "path";
import { User, Bug, bugSchema } from "./models/models.js";
import { password } from "./password.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "public")));


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// tew code