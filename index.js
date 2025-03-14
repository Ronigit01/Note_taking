const express = require("express")
const app = express();

const userModel = require("./model/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine" , "ejs")

app.get("/", (req, res) => {
    res.render("index", { theme: "light" }); // Pass theme variable
});

const isLoggedin = (req,res,next) => {
    
    if(!req.cookies.token) {
        res.send("you must be login")
    }else{
        const data = jwt.verify(req.cookies.token, "shhh")
        req.user = data;
    }
    next();
}


app.get("/login", (req,res)=>{
    res.render("login")
})

app.get("/profile",isLoggedin , (req,res)=>{
    res.render("profile")
})

app.post("/create",async (req,res)=>{
    const {email, password} = req.body;

    const user =await userModel.findOne({email:email})

    if(user) return res.send("user already exits")
   
    bcrypt.genSalt(10,(err, salt)=>{
        bcrypt.hash(password, salt ,async (err,hash)=>{
            const user = await userModel.create({
                email: email,
                password: hash,
            })

            const token = jwt.sign({email:email} , "shhh");
            res.cookie("token",token)
            console.log(req.cookies.token)
            res.redirect("/login")
        })
    })

})

app.post("/login",async (req,res)=>{

    const {email, password} = req.body;
    const user  = await userModel.findOne({email: email})

    if(!user) return res.send("user does not exits")
    
    bcrypt.compare(password, user.password, (err,result)=>{
        if(result) return res.redirect("/profile")
            res.redirect("/login")
         
    })

    const token = jwt.sign({email:email}, "shhh")
    res.cookie("token", token)

})

app.get("/logout",(req,res)=>{
    res.cookie("token","")
    res.redirect("/login")
})



app.listen(3000)