const Listing = require('./models/listing.js'); 
const Review = require('./models/review.js'); 
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //create a redirect prop into req.session 
    req.session.redirectUrl = req.originalUrl; 
    req.flash("error", "You must be logged in !");
    return res.redirect("/login");
  }
  next(); 
};


module.exports.savedRedirectUrl = (req, res, next) => {
  if(req.session.redirectUrl) {
     res.locals.redirectUrl= req.session.redirectUrl; 
  }

  next(); 
}

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
    let listing = await Listing.findById(id); 
    if(!listing.owner.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the owner of this listing.");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validationListing = (req, res, next) =>{
  let { error } = listingSchema.validate(req.body.listing);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
}
module.exports.validationReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body.listing);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId); 
    if(!review.author.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not the author of this review!");
      return res.redirect(`/listings/${id}`);
    }
    next();
}