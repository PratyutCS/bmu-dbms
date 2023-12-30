require("dotenv").config()
let Express = require('express')
let path = require('path')
const mongoose = require('mongoose')
let bodyparser=require('body-parser');
const session = require('express-session');
const mongodbsession = require('connect-mongodb-session')(session);
const app = Express()
var fs = require('fs');
const xlsx = require('xlsx');
const multer = require('multer');

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
    type: String,
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
    collection:'sessions',
});

let xltojson = require("./scripts/xltojson.js");


const getDestination = (req, file, cb) => {
  // Implement your logic to determine the destination folder here
  const folderName = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/"); // Replace with your logic
  console.log(folderName);

  // The callback function expects the error as the first argument and the destination folder as the second argument
  cb(null, `${folderName}`);
};

const storage = multer.diskStorage({
  destination: getDestination,
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, //5 mbs
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only xlsx files are allowed.'), false);
    }
  },
  storage: storage,
});

app.use(session({
    secret:secretKey,
    resave:false,
    saveUninitialized:false,
    cookie: {
        maxAge: 12 * 60 * 60 * 1000, /* (hour * min * sec * milli_sec) = 12 hours session key valid */
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

app.post("/index", async(req, res) => {
    if(req.body.uname == undefined || req.body.psw.length == undefined){
        res.redirect("/");
    }
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
                    let useremail = await Node.findOne({title:email,content:pass});
    
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
});

app.post("/logout",isAuth, (req, res) => {
    let u = req.session.username;
    req.session.destroy((err)=>{
        if(err){
            throw err;
        }
        else{
            console.log(u+" logged out successfully. ");
            res.redirect("/");
        }
    });
});


app.get("/dashboard", isAuth ,(req, res) => {
    res.render('index',{
                        type : req.session.type,
                        name : req.session.username,
                    });
});

// to remove
app.post("/dashdata", isAuth ,(req,res)=>{
    if(typeof req.body.dashboard == "boolean" && typeof req.body.forms == "boolean" && req.body.dashboard != undefined && req.body.forms != undefined && req.body.dashboard != req.body.forms){
        req.session.dashboard = req.body.dashboard;
        req.session.forms = req.body.forms;
    }
    res.redirect("/dashboard");
});

// to remove
app.post("/formdata", isAuth ,(req,res)=>{
    if(typeof req.body.form1 == "boolean" && typeof req.body.form2 == "boolean" && typeof req.body.form3 == "boolean" && req.body.form1 != undefined && req.body.form2 != undefined && req.body.form3 != undefined && req.body.form1!=req.body.form2!=req.body.form3){
        req.session.form1 = req.body.form1;
        req.session.form2 = req.body.form2;
        req.session.form3 = req.body.form3;
    }
    res.redirect("/dashboard");
});

app.get("/pg", isAuth ,(req,res)=>{

    const directoryPath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel");
    let name="";
    let head = "";
    let count = 0;
    for(let i=req.session.pg.length;i>=0;i--){
        if(req.session.pg.charAt(i)==='/'){
            count+=1;
            if(count == 2)
            break;
        }
        else if(count == 1){
            head=req.session.pg.charAt(i)+head;
        }
        else{
            name=req.session.pg.charAt(i)+name;
        }
    }
    let fileList = [];

    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.log('Unable to scan directory: ' + err);
            res.redirect("/");
        }
        else{
            files.forEach(function (file) {
                fileList.push(file.substring(0,file.length-5));
            });
            res.render("./up",{
                list : fileList,
                type : req.session.type,
                head : head,
                name : name,
            });
        }
    });
});

app.post("/pg", isAuth ,(req,res)=>{
    req.session.pg = req.body.pg;
    res.redirect("/pg");
});

app.post('/upload', upload.single('file'),isAuth, (req, res) => {
    const file = req.file;
    if (!file) {
        console.log("filenotfound nb");
        return res.redirect("/pg");
    }
    try {
      xltojson.xtj(req,file);
      res.redirect("/pg");
    } 
    catch (error) {
      console.error('Error reading file:', error);
      res.status(500).send('Error reading file.');
    }
  });

app.post('/content',isAuth,(req,res) => {
    filePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/json/"+req.body.fileName+".json");
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
        } 
        else {
          try {
            res.render('content.ejs',{
                data : data,
            });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    });
});

app.post('/delete',isAuth,(req,res) => {
    jsonFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/json/"+req.body.fileName+".json");
    xlFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/"+req.body.fileName+".xlsx");
    fs.unlinkSync(jsonFilePath);
    fs.unlinkSync(xlFilePath);
    res.redirect("/pg");
  });

app.post('/download',isAuth,(req,res) => {
    xlFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/"+req.body.fileName+".xlsx");
    res.status(200).download(xlFilePath, req.body.fileName+".xlsx");
  });

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


const PORT= process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running at "+PORT);
    mongoose.connect(urri)
    .then((result)=>console.log("mdb 1 passed"))
    .catch((err)=>console.log(err));
});