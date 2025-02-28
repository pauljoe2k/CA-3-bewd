const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const app = express()

SECRET_KEY = "IWUBVWI12341@3421"

app.use(express.json());
app.use(cookieParser);

let users = [
    {username:"user",password:"user@123"},
    {username:"admin",password:"password@123"},
]

app.post('/login',async (req,res) => {
    const {username,password} = req.body;
    const userfound = users.find(user=> user.username == username && user.password == password);
    if(!userfound){
        return res.status(400).send({message:"Invalid credentials"});
    }
    const token = jwt.sign({username:userfound.username, password:userfound.password},SECRET_KEY,{expiresIn:'10m'})

    res.cookie('auth',token,{
        httpOnly:true,
        secure:true,
        maxAge: 10 * 60 * 1000 
    });
    return res.status(200).send({message:"Logged in successfully"});
})

async function authorize(req,res,next) {
    try {
        const auth = req.headers.authorization;
        if(!auth){
            return res.status(400).send({message:"unauthorized"});
        }
        const token = auth.split(" ")[1];
        jwt.verify(token,SECRET_KEY,(err,decoded)=>{
            if(err){
                return res.status(400).send({message:"Unauthorized"})
            }
            decoded = req.users;
            next();
        })
    } catch (error) {
        console.log(error);
        return res.status(401).send({message:"Unauthorized"})
    }
    
}

app.get('/admin-dashboard',authorize,(req,res)=>{
    return res.status(200).send({message:"Welcome to your dashboard"});
});

app.get('/validity',authorize,(req,res)=>{
    return res.status(200).send({message:"Authorized successfully"});
});



app.listen(3000,()=>{
    console.log("Server is running in port 3000")
})