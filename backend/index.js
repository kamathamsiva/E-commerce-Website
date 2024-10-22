const port  = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");
const { strict } = require("assert");
const { error } = require("console");

app.use(express.json());
app.use(cors());

// Database connection mangodb

mongoose.connect("mongodb+srv://kamathamsiva:sivakumar%4023@cluster0.f5erh.mongodb.net/e-commerce")

// API creation

app.get('/',(req, res)=>{
    res.send("Express App is Running")

})

// Image Storage Engine

 const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
 })

 const upload = multer({storage:storage})

// Creating Upload Endpoint For image

app.use('/images',express.static('upload/images'))

app.post("/upload", upload.single('product'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: 0,
            message: "No file uploaded",
        });
    }

    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`,
    });
});


// scheme for creating products

const Product =  mongoose.model("Product",{
    id:{
        type:Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})

app.post('/addproduct',async(req,res)=>{
    
    let products = await Product.find({});
    let id;
    if (products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id=1;
    }
    
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,

    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

// Creating API For Deleting

app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

// Creating API For Getting all Products

app.get("/allproducts",async (req,res)=>{
    let products = await Product.find({})
        console.log("All Products Fetched");
        res.send(products);
})

//Scheme creating for user Model
const Users = mongoose.model("Users",{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating endpoint for registerring the user

app.post('/signup',async (req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if (check){
        return res.status(400).json({success:false,errors:"existing user found with same email address"})
    }
    let cart = {};
    for (let i = 0; i < 300; i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,  
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }

    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
    
})

// creating endpoint for user login
app.post('/login', async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user){
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,error:"Wrong Password"})
        }
    }
    else{
        res.json({success:false,error:"Wrong Email Id"})
    }
})

// Creating endpoint for newcollection data
app.get('/newcollections', async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection);
})

//creating endpoint for popular in women section
app.get('/popularwomen', async(req,res)=>{
    let products = await Product.find({category:'women'});
    let popularwomen = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popularwomen);
})

//creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if (!token){
        res.status(401).send({error:'Please Authenticate using Valid'})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        }catch(error){
            res.status(401).send({error:"Please Authenticate using a valid token"})
        }
    }
}
// creating endpoint for adding product in cartdata
app.post('/addtocart', fetchUser,async(req,res)=>{
    console.log('Added', req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")

})

//creating endpoint to remove product from cart data

app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log('removed', req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id});
    if (userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("removed")

})

// creating endpoint to get cart data

 app.post('/getcart',fetchUser,async (req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})  

app.listen(port, (error)=>{
    if (!error){
        console.log("Server Running on Port " + port)
    } 
    else
    {
        console.log("Error :"+error)
    }
})