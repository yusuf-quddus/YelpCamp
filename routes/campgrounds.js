var express	   = require("express"),
 	router 	   = express.Router(),
 	Campground = require("../models/campgrounds"),
 	middleware = require("../middleware");

// INDEX route - show all campgrounds
router.get("/", function(req, res){
	//get campgrounds from DB
	Campground.find({},function(err, allCampgrounds){
		if(err){
			console.log(err);
		} else {
			res.render("campgrounds/index", {campgrounds:allCampgrounds, currentUser: req.user});
		}
	});
});

// CREATE route
router.post("/", middleware.isLoggedIn, function(req, res){
	//get data from form and add to campground array
	var name = req.body.name;
	var image = req.body.image;
	var price = req.body.price;
	var desc = req.body.description;
	var author = {
		  id: req.user._id,
          username: req.user.username
	}
	var newCampground = {name: name, price: price, image: image, description: desc, author:author}
	//campgrounds.push(newCampground);
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			//reditect back to camground page
			res.redirect("/campgrounds");
		}
	})
});

// NEW route - show form to create campground
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});

// SHOW route - presents info
router.get("/:id", function(req, res){
    //find the campground with provided ID
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
			if (!foundCampground) {
            	return res.status(400).send("Item not found.")
       		}
            console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground){
		if (!foundCampground) {
            	return res.status(400).send("Item not found.")
       	}
		res.render("campgrounds/edit", {campground: foundCampground});
	});
});
	
// UPDATE campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updateCampground){
		if(err){
			res.redirect("/campgrounds");
		} else {
			if (!updateCampground) {
            	return res.status(400).send("Item not found.")
       		}
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

// DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/campgrounds");
		} else {
			req.flash("success", "Campground deleted");
			res.redirect("/campgrounds");
		}
	})
});

module.exports = router;