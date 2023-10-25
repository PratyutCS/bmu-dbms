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

const nodesSchema = {
    title: String,
    content: String,
    type: String,
    isLog: String
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
    else{
        res.render('login');
    }
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
            isWrong=true;
            res.redirect("/");
        }
        else{
            const useremail=await Node.findOne({title:email});
    
            if(!useremail){
                isWrong=true;
                res.redirect("/");
            }
            else if(useremail.content === pass){
                if(useremail.isLog === "false"){
                    let newData={
                        title: useremail.title,
                        content: useremail.content,
                        type: useremail.type,
                        isLog: "true"
                    };
                    Node.updateOne({ _id: useremail._id}, newData)
                    .then(() => {
                            req.session.userid = useremail._id,
                            req.session.dashboard = true;
                            req.session.forms = false;
                            req.session.form1 = true;
                            req.session.form2 = false;
                            req.session.form3 = false;
                            req.session.isAuth = "true";
                            req.session.username = useremail.title;
                            isWrong = false;
                            req.session.type = useremail.type;
                            req.session.content = useremail.content;
                            console.log(req.session.username+' logged in successfully.');
                            res.redirect("/dashboard");
                    })
                    .catch((error) => {
                        console.error('Error loggin in the user', error);
                        isWrong=true;
                        res.redirect("/");
                    });
                }
                else{
                    console.log("second user trynna login");
                    res.redirect("/");
                }
            }
            else{
                isWrong=true;
                res.redirect("/");
            }
        }
    }
    catch(error){
        isWrong=true;
        console.log(error);
        res.redirect("/");
    }
})

app.post("/logout",isAuth, (req, res) => {
    let newData={
        title: req.session.username,
        content: req.session.content,
        type: req.session.type,
        isLog: "false"
    };
    Node.updateOne({ _id: req.session.userid}, newData)
    .then(() => {
        console.log(req.session.username+' logged out successfully.');
        req.session.destroy((err)=>{
            if(err) throw err;
            res.redirect("/");
        });
    })
    .catch((error) => {
        console.error('Error loggin out the user', error);
    });
})


app.get("/dashboard", isAuth ,(req, res) => {
    res.render('index',{type : req.session.type,
                        name : req.session.username,
                        dashboard : req.session.dashboard,
                        forms : req.session.forms,
                        form1 : req.session.form1,
                        form2 : req.session.form2,
                        form3 : req.session.form3,
                    });
})

app.post("/dashdata", isAuth ,(req,res)=>{
    if(typeof req.body.dashboard == "boolean" && typeof req.body.forms == "boolean" && req.body.dashboard != undefined && req.body.forms != undefined && req.body.dashboard != req.body.forms){
        req.session.dashboard = req.body.dashboard;
        req.session.forms = req.body.forms;
    }
    res.redirect("/dashboard");
})

app.post("/formdata", isAuth ,(req,res)=>{
    if(typeof req.body.form1 == "boolean" && typeof req.body.form2 == "boolean" && typeof req.body.form3 == "boolean" && req.body.form1 != undefined && req.body.form2 != undefined && req.body.form3 != undefined && req.body.form1!=req.body.form2!=req.body.form3){
        req.session.form1 = req.body.form1;
        req.session.form2 = req.body.form2;
        req.session.form3 = req.body.form3;
    }
    res.redirect("/dashboard");
})

// Simulate an error

// app.get('/error', (req, res, next) => {
//     const error = new Error('This is a test error');
//     next(error);
//  });
 
app.get("*", (req, res) => {
    res.sendFile(path.join(htmlfolder, "error.html"));
});


app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Internal Server Error');
  });


const PORT= process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server is running at "+PORT);
    mongoose.connect(urri)
    .then((result)=>console.log("mdb 1 passed"))
    .catch((err)=>console.log(err));
})