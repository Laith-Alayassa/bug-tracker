import express from "express";
const app = express()
const port = process.env.PORT


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.json());


// BODY PARSER HERE ___________

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/static", express.static(path.join(__dirname, "public")));



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})