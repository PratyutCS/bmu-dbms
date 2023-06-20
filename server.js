let Express = require('express')
let path = require('path')
const mongoose = require('mongoose')
let bodyparser=require('body-parser');
const session = require('express-session');
const mongodbsession = require('connect-mongodb-session')(session);


const app = Express()

app.use(bodyparser.urlencoded({extended: true}));

app.use(Express.static(__dirname + '/public/src'));
app.use(Express.static(__dirname + '/public/assets'));
app.use(Express.static(__dirname + '/public/js'));

let htmlfolder = path.join(__dirname, "/public/html");

app.set('view engine','ejs');
app.set("views",path.join(__dirname, "./templates/views"))

const urri = "mongodb+srv://AikataPratyut:aikata%40123@mscdb.0tplylu.mongodb.net/iqacDB";

mongoose.connect(urri)
.then((result)=>console.log("works "+result))
.catch((err)=>console.log(err));

const nodesSchema = {
    title: String,
    content: String,
    type: String
}
const Node = mongoose.model('Node', nodesSchema)

const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next()
    }
    else{
        res.redirect("/");
    }
}

const store = new mongodbsession({
    uri:urri,
    collection:'sessions'
})

app.use(session({
    secret:"key that will protect the world",
    resave:false,
    saveUninitialized:false,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000
      },
    store:store
}))

app.get("/", (req, res) => {
    if(req.session.isAuth){
        res.redirect("/dashboard");
    }
    res.sendFile(path.join(htmlfolder, "index.html"));
})

app.post("/index", async(req, res) => {
    try{
        const email= ((req.body.uname).toString()).trim();
        const pass = ((req.body.psw).toString()).trim();

        if(email.length > 9 || pass.length > 9){
            res.redirect("/");
        }
        else{
            const useremail=await Node.findOne({title:email});
    
            if(!useremail){
                res.redirect("/");
            }
            else if(useremail.content === pass){
                req.session.isAuth="true";
                req.session.username=useremail.title;
                req.session.type=useremail.type;
                res.redirect("/dashboard");
            }
            else{
                res.redirect("/");
            }
        }
    }
    catch(error){
        console.log(error);
        res.status(400).send("error cannot find username :  "+error);
    }
})

app.post("/logout", (req, res) => {
    req.session.destroy((err)=>{
        if(err) throw err;
        res.redirect("/");
    });
})


app.get("/dashboard", isAuth ,(req, res) => {
    res.render('index',{type:req.session.type});
})

app.get("*", (req, res) => {
    res.sendFile(path.join(htmlfolder, "error.html"));
})

const PORT= process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running at lolz "+PORT);
    mongoose.connect(urri)
    .then((result)=>console.log("works "+result))
    .catch((err)=>console.log(err));
})