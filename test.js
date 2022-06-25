import express from "express";


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