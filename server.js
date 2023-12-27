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

let htmlfolder = path.join(__dirname, "/public/html");

app.set('view engine','ejs');
app.set("views",path.join(__dirname, "./templates/views"));

const urri = process.env.dburi;
const secretKey = process.env.dbSessionKey;

const nodesSchema = {
    title: String,
    content: String,
    type: String
};

const Node = mongoose.model('Node', nodesSchema);


const  nodesSchema2 = {
    expires: Date,
    session: Object,
};


const Node2 = mongoose.model('Session', nodesSchema2);


const isAuth=(req,res,next)=>{
    if(req.session.isAuth){
        next();
    }
    else{
        res.redirect("/");
    }
};

const store = new mongodbsession({
    uri:urri,
    collection:'sessions'
});

app.use(session({
    secret:secretKey,
    resave:false,
    saveUninitialized:false,
    cookie: {
        maxAge: 10 * 60 * 60 * 1000 // hour * min * sec * milli_sec
      },
    store : store,
}));

app.get("/", (req, res) => {
    if(req.session.isAuth){
        res.redirect("/dashboard");
    }
    else{
        res.render('login');
    }
});

function check(q){
    for(let i=0;i<q.length;i++){
        let ue=q.charCodeAt(i);
        if(!((ue>=64 && ue<=90) || (ue>=97 && ue<=122) || (ue>=48 && ue<=57))){
            return true;
        }
    }
    return false;
}

async function fetchData(email,pass){
    const fr = await Node.findOne({title:email,content:pass});
    return fr;
}

app.post("/index", async(req, res) => {
    try{
        const email = ((req.body.uname).toString()).substring(0, 16);
        const pass = ((req.body.psw).toString()).substring(0, 16);
        
        if(check(email) || check(pass)){
            res.redirect("/");
        }
        else{
            await Node2.find({})
            .then(async data => {
                let flag = true;
                for(var i=0;i<data.length;i++){
                    if(data[i].session.username === email){
                        console.log(email + " trynna second login");
                        flag = false;
                        res.redirect("/");
                    }
                }
                if(flag){
                    let useremail = await fetchData(email,pass);
    
                    if(!useremail){
                        console.log("user not found");
                        res.redirect("/");
                    }
                    else{
                        req.session.userid = useremail._id;
                        req.session.dashboard = true;
                        req.session.forms = false;
                        req.session.form1 = true;
                        req.session.form2 = false;
                        req.session.form3 = false;
                        req.session.isAuth = "true";
                        req.session.username = useremail.title;
                        req.session.password = useremail.content;
                        req.session.type = useremail.type;
                        console.log(req.session.username+' logged in successfully.');
                        res.redirect("/dashboard");
                    }
                }
              })
              .catch(err => {
                console.error(err);
              });    
        }
    }
    catch(error){
        console.log(error);
        res.redirect("/");
    }
})

app.post("/logout",isAuth, (req, res) => {
    let newData={
        title: req.session.username,
        content: req.session.content,
        type: req.session.type
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