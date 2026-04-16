const Listing = require("../models/listing");
const { cloudinary } = require("../cloudConfig");
const getCoordinates = require("../utils/geocode");

module.exports.index = async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash("error", "You must be logged in to create listing!");
        return res.redirect("/login");
    }
    res.render("./listings/new.ejs");
}

module.exports.showListing = async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: {path: "author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
}

module.exports.createListing = async (req, res, next) => {
    if (!req.file) {
        throw new ExpressError("Image is required", 400);
    }

    let url = req.file.path;
    let filename = req.file.filename;

    const newListing = new Listing(req.body.listing);

    // 🔥 GET LOCATION
    const location = req.body.listing.location;

    // 🔥 GEOCODING
    const coords = await getCoordinates(location);

    console.log("Location entered:", location);
    

    // ❌ if no coords
    if (!coords) {
        req.flash("error", "Invalid location");
        return res.redirect("/listings/new");
    }

    // ✅ SAVE AS GEOJSON
    newListing.geometry = {
    type: "Point",
    coordinates: [coords.lng, coords.lat]
    };

    console.log("Geometry:", newListing.geometry);

    newListing.image = { url, filename };
    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res)=>{
    console.log("Edit route hit");
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/edit.ejs",{listing, originalImageUrl});
}

module.exports.updateListing = async (req, res) => {

    let { id } = req.params;
    let { listing } = req.body;

    let existingListing = await Listing.findById(id);

    if (!existingListing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // ✅ Update text fields
    existingListing.title = listing.title;
    existingListing.description = listing.description;
    existingListing.price = listing.price;
    existingListing.country = listing.country;
    existingListing.location = listing.location;

    // ✅ If new image uploaded
    if (req.file) {
        // 🔥 delete old image from cloudinary
        await cloudinary.uploader.destroy(existingListing.image.filename);

        // ✅ assign new image
        existingListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    // ✅ single save
    await existingListing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleetd!");
    res.redirect("/listings");
}