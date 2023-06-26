let dashboard = true;
let forms = false;
let form1 = true;
let form2 = false;
let form3 = false;

require("dotenv").config()
let Express = require('express')
let path = require('path')
const mongoose = require('mongoose')
let bodyparser=require('body-parser');
const session = require('express-session');
const mongodbsession = require('connect-mongodb-session')(session);
const app = Express()

app.use(bodyparser.urlencoded({extended: true}));
app.use(Express.json());
app.use(Express.static(__dirname + '/public/src'));
app.use(Express.static(__dirname + '/public/assets'));
app.use(Express.static(__dirname + '/public/js'));

let htmlfolder = path.join(__dirname, "/public/html");

app.set('view engine','ejs');
app.set("views",path.join(__dirname, "./templates/views"))

const urri = process.env.dburi;
const secretKey = process.env.dbSessionKey;

mongoose.connect(urri)
.then((result)=>console.log("mdb 2 passed"))
.catch((err)=>console.log(err));

const nodesSchema = {
    title: String,
    content: String,
    type: String
}
const Node = mongoose.model('Node', nodesSchema)

const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next();
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
    secret:secretKey,
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
        let q=false,w=false;
        for(let i=0;i<email.length;i++){
            let ue=email.charCodeAt(i);
            if(!((ue>=65 && ue<=90) || (ue>=97 && ue<=122) || (ue>=48 && ue<=57))){
                q=true;
                break;
            }
        }
        for(let i=0;i<pass.length;i++){
            let ue=pass.charCodeAt(i);
            if(!((ue>=64 && ue<=90) || (ue>=97 && ue<=122) || (ue>=48 && ue<=57))){
                w=true;
                break;
            }
        }
        if(q || w || email.length>16 || pass.length>16){
            res.redirect("/");
        }
        else{
            const useremail=await Node.findOne({title:email});
    
            if(!useremail){
                res.redirect("/");
            }
            else if(useremail.content === pass){
                dashboard = true;
                forms = false;
                form1 = true;
                form2 = false;
                form3 = false;
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
    res.render('index',{type : req.session.type,
                        name : req.session.username,
                        dashboard : dashboard,
                        forms : forms,
                        form1 : form1,
                        form2 : form2,
                        form3 : form3,
                    });
})

app.post("/dashdata", isAuth ,(req,res)=>{
    if(typeof req.body.dashboard == "boolean" && typeof req.body.forms == "boolean" && req.body.dashboard != undefined && req.body.forms != undefined && req.body.dashboard != req.body.forms){
        dashboard = req.body.dashboard;
        forms = req.body.forms;
    }
    res.redirect("/dashboard");
})

app.post("/formdata", isAuth ,(req,res)=>{
    if(typeof req.body.form1 == "boolean" && typeof req.body.form2 == "boolean" && typeof req.body.form3 == "boolean" && req.body.form1 != undefined && req.body.form2 != undefined && req.body.form3 != undefined && req.body.form1!=req.body.form2!=req.body.form3){
        form1 = req.body.form1;
        form2 = req.body.form2;
        form3 = req.body.form3;
    }
    res.redirect("/dashboard");
})

app.get("*", (req, res) => {
    res.sendFile(path.join(htmlfolder, "error.html"));
})

const PORT= process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running at "+PORT);
    mongoose.connect(urri)
    .then((result)=>console.log("mdb 1 passed"))
    .catch((err)=>console.log(err));
})