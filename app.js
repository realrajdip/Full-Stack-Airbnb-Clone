const express = require("express");
const app = express();

const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const path = require("path");
const bodyPaser = require("body-parser");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(bodyPaser.json());
app.use(express.urlencoded({ extended: true })); //so that req.params get parsed
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions = {
  secret: "secretCode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //save the cookies for a week so that we don't have to login for a week
    maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
    httpOnly: true,
  },
};


app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); //to check if the user is same or not in different routes
passport.use(new LocalStrategy(User.authenticate())); //login page
passport.serializeUser(User.serializeUser()); //save some data  of user to be used later on...basically used so that user does not have to login everytime 
passport.deserializeUser(User.deserializeUser()); //retrieve the saved data from the id and turn it back

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/airbnbTest");
}

//so that we can access flash and session's prop inside ejs
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  // console.log(res.locals.success);
  res.locals.currUser = req.user; 
  next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//Page Not Found
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

//Error Handler Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message)
  res.status(statusCode).render("error", { err });
});
app.listen(3000, () => {
  console.log("Server is listening to port 3000");
});
