const express = require("express")
const { connectToMongoDb } = require("./connect")
const path = require("path")
const URL = require("./models/url")
const cookieParser = require("cookie-parser")
const { restrictToLoggedInUserOnly, checkAuth } = require("./middlewares/auth")

const urlRoute = require("./routes/url")
const staticRoute = require("./routes/staticRouter")
const userRoute = require("./routes/user")

const PORT = 8001
const app = express();

connectToMongoDb("mongodb://127.0.0.1:27017/short-url")
  .then(() => console.log("MongoDB connected"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"))

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// app.get("/test",async (req,res)=>{
//   const allUrls=await URL.find({});
//   res.render("home",{
//     urls:allUrls,
//   })
// })

app.use("/url", restrictToLoggedInUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth, staticRoute);

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId
  const entry = await URL.findOneAndUpdate({
    shortId
  }, {
    $push: {
      visitHistory: {
        timestamp: Date.now()
      }
    },
  })
  res.redirect(entry.redirectURL)
})

app.listen(PORT, () => console.log(`Server started on PORT :${PORT}`))