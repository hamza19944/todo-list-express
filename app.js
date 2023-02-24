const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const _ = require("lodash")

const app = express()

app.set('view engine', 'ejs');

app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended: true}))

mongoose.connect("mongodb+srv://hamza-adel:Hamzaadel1@cluster0.zflf6rx.mongodb.net/todolistDB")

const itemSchema = new mongoose.Schema({
    name: String
})
const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
    name: "buy food"
})
const item2 = new Item({
    name: "cook food"
})
const item3 = new Item({
    name: "eat food"
})

const defaultItems = [item1, item2, item3]

const customList = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})
const List = mongoose.model("List", customList)

app.get("/", (req, res) => {
    Item.find({}, (err, results) => {
        if(err){
            console.log(err)
        }else{
            if(results.length === 0){
                Item.insertMany([item1, item2, item3], err => {
                    if(err){
                        console.log(err)
                    }else{
                        console.log("successfully added to the DataBase")
                    }
                })
                res.redirect("/")
            }else{
                res.render("list", {listTitle: "today", newItem : results})
            }
        }
    })
})

app.get("/:listcat", (req, res) => {
    const listCat = _.capitalize(req.params.listcat)
    
    List.findOne({name: listCat}, (err, result) => {
        if(!err){
            if(!result){
                const list = new List({
                    name: listCat,
                    items: defaultItems
                });
                list.save()
                res.redirect("/" + listCat)
            }else{
                res.render("list", {listTitle: result.name, newItem : result.items})
            }
        }
    })
})

app.post("/", (req, res) => {
    let itemName = req.body.task
    let listName = req.body.list

    const item = new Item({
        name: itemName
    })

    if(listName === "today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item)
            foundList.save()
            res.redirect("/" + listName)
        })
    }
    
})

app.post("/delete", (req, res) => {
    const itemId = req.body.checkbox
    const listName = req.body.listName

    if(listName === "today"){
        Item.findByIdAndRemove(itemId, err => {
        if(!err){
            console.log("successfully Deleted");
            }
        })
        res.redirect("/")
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, result) => {
            res.redirect("/" + listName)
        })
    }
})

let port = 3000
app.listen(port || 3000, () => {
    console.log("Server Is Running");
})