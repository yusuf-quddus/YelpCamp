var express 	= require("express"),
	router 		= express.Router({mergeParams: true}),
 	Campground 	= require("../models/campgrounds"),
 	comment 	= require("../models/comment"),
 	middleware 	= require("../middleware");

// NEW comments
router.get("/new", middleware.isLoggedIn, function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		}
		else {
			if (!campground) {
            	return res.status(400).send("Item not found.")
       		}
			res.render("comments/new", {campground: campground});
		}
	});
});

// CREATE comments
router.post("/", middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if(err) {
			console.log(err);
			res.redirect("/campgrounds");
		} else {
			if (!campground) {
            	return res.status(400).send("Item not found.")
       		}
			comment.create(req.body.comment, function(err, comment){
				if(err) {
					req.flash("error", "Something went wrong");
					console.log(err);
				}
				else {
					//req.user.username
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully posted comment");
					res.redirect("/campgrounds/" + campground._id);
				} 
			})
		}
	});
});

// EDIT comments route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	comment.findById(req.params.comment_id, function(err, foundComment){
		if(err) {
			res.redirect("");
		} else {
			if (!foundComment) {
            	return res.status(400).send("Item not found.")
       		}
		res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
		}
	});
});

// UPDATE comments route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
		  console.log(err);
          res.redirect("back");
      } else {
		  if (!updatedComment) {
            	return res.status(400).send("Item not found.")
       		}
          res.redirect("/campgrounds/" + req.params.id );
      }
	});
});

// DESTROY comments route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
	comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else {
			req.flash("success", "Comment deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
})

module.exports = router;