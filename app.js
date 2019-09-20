// jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _=require('lodash');

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//const items=["eSIP - Home design and Edit Details amalgamation","VCR - Trailing Credit UI designing","How to grow Pudina leaves(Mint) at home?"];
//const workItems=[];

mongoose.connect("mongodb+srv://admin-aadesh:aadesh08@cluster0-vczp4.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
},function(err){
  console.log(err);
});

// Create a Schema
const itemsSchema = {
  name: String
};
// Create a Mongoose model based on the above schema
// mongoose.model("SingularCollectionName",schemaName)
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

const defaultItems = [];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
let today = new Date();
var options = {
  weekday: "short",
  day: "numeric",
  month: "long"
};
const day = today.toLocaleDateString("en-US", options);
const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Successfully inserted data!!");
      });
    }
    res.render("list", {
      //listTitle: day,
      listTitle: "Today",
      newListItem: foundItems
    });
  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      if (!err) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(Err, foundList) {
    if (!Err) {
      if (!foundList) {
        // ceate a new lists
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
    }

  });

});

app.post("/work", function(req, res) {
  var item = req.body.newItem;
  if (req.body.list === "Work List") {
    WorkList.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/about", function(req, res) {
  res.render("about", {});
  console.log("About page");
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err)
        console.log(err);
      else
        console.log("Deleted Successfully");
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      {name:listName},{$pull:{items:{_id:checkedItemId}}},
      function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      }
    );
  }

});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server listening on port 3000");
});
