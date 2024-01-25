 const express = require("express");
 const bodyParser = require("body-parser");
 const mongoose = require('mongoose');
 const _ = require("lodash");
 const firebase = require("firebase-admin");
 const functions = require("firebase-functions");
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
//  accessing a local module
 // const date = require(__dirname + "/date.js")

const firebaseApp = firebase.ini;

 const app = express();

// const items = ["Buy Food", "Eat Food", "Cook Food"]
// const workItems = []

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// public to use static files lik images, css, js
app.use(express.static("public"));


//  database
mongoose.connect('mongodb+srv://Admin-Ounini:Slimmzy2468@atlascluster.bvmxvgc.mongodb.net/todolistDB');
// mongoose.connect("mongodb://127.0.0.1/todolistDB")
const itemsSchema = {
	name: String
}
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
	name: "Welcome to your todolist!"
});
 
const item2 = new Item({
	name: "Hit the + button to add a new item"
});

const item3 = new Item({
	name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];
const listSchema = {
	name: String,
	items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
	res.set("Cache-Control", "public, max-age=300, s-maxage=600");
 	// const day = date.getDate()
	
	Item.find({}).then(result => {		
		if (result.length === 0) {
			Item.insertMany(defaultItems);
		res.redirect("/");
		 // needed incase of incasity
		} else {
 		res.render("list", {listTitle: "Today", newListItems:  result}); 
		}
	});
});

app.post("/", function (req, res) {
 	const itemName = req.body.newItem;
 	const listName = req.body.list;

 	const item = new Item({
 		name: itemName
 	});

 	if (listName === "Today") {
 		item.save();
 		res.redirect("/");	
 	} else {
 		List.findOne({name: listName}).then(result => {
 			result.items.push(item);
 			result.save();
 			res.redirect("/" + listName);
 		});
 	}

 	

// if (req.body.list === "Work") {
// 	workItems.push(item)
// 	res.redirect("/work")
// } else {
// 	items.push(item)
// 	res.redirect("/")
// } 

});

app.post("/delete", function(req, res) {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Today") {
		Item.findByIdAndDelete(checkedItemId).then(result => {
			console.log(result);
		res.redirect("/");
		});
	} else {
		List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(result => {
			res.redirect("/" + listName);
		});
	}

	
});

// app.get("/work", function (req, res) {
// 	res.render("list", {listTitle: "Work List", newListItems: workItems})
// })
app.get("/:customListName", function(req, res) {
	const customListName = _.capitalize(req.params.customListName);

	List.findOne({name: customListName}).then(result => {
		if (result) {
			// show an existing list
			res.render("list", {listTitle: result.name, newListItems: result.items});
		} else {
			// create a new list
			const list = new List({
			name: customListName,
			items: defaultItems
		});
		list.save();
		res.redirect("/" + customListName);
		}
	});
	
});

app.get("/about", function (req, res) {
	res.render("about");
});


app.post("/work", function(req, res) {
	const  item = req.body.newItem;
	workItems.push(item);
	res.redirect("/work");
});

 let port = process.env.PORT
if (port == null || port == "") {
 	port = 3000
 }
 app.listen(port, function() {
  	console.log("Server started on port 3000")
  })

// exports.app = functions.https.onRequest(app);
