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
const csurf = require('csurf');
const cookie = require('cookie-parser');
const csrfProtection = csurf({ cookie: true });

app.use(cookie());
app.use(bodyparser.urlencoded({extended: true}));
app.use(Express.json());
app.use(Express.static(__dirname + '/public/src'));
app.use(Express.static(__dirname + '/public/assets'));
app.use(Express.static(__dirname + '/public/iqac'));
app.set('trust proxy', true);

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

const xltojson = require("./scripts/xltojson.js");
const research = require("./scripts/research.js");


const getDestination = (req, file, cb) => {
  const folderName = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/");
  console.log(folderName);
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


app.use(csrfProtection);
app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    next();
});

app.get("/", (req, res) => {
    if(req.session.isAuth){
        res.redirect("/dashboard");
    }
    else{
        res.render('login',{
            csrfToken:req.csrfToken(),
        });
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
    if(!req.body.uname || !req.body.psw){
        res.redirect("/");
    }
    else{
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
                        csrfToken : req.csrfToken(),
                    });
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
            res.render("./coe",{
                list : fileList,
                type : req.session.type,
                head : head,
                name : name,
                csrfToken:req.csrfToken(),
            });
        }
    });
});

var isValid=(function(){
  var rg1=/^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
  var rg2=/^\./; // cannot start with dot (.)
  var rg3=/^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names
  return function isValid(fname){
    return rg1.test(fname)&&!rg2.test(fname)&&!rg3.test(fname);
  }
})();

app.post("/pg", isAuth ,(req,res)=>{
    if(isValid(req.body.pg) && isValid(req.body.pg1)){
        const folderName = path.join(__dirname,"/"+req.session.type+"/"+req.body.pg+"/"+req.body.pg1);
        if(fs.existsSync(folderName)){
            req.session.pg = "/"+req.body.pg+"/"+req.body.pg1;
            res.redirect("/pg");
        }
        else{
            console.log("folder not found : "+folderName);
            res.redirect("/");
        }
    }
    else{
        console.log("invalid filename");
        res.redirect("/");
    }
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
    if(!req.body.fileName){
        console.log("filename_not_found : "+req.body.fileName);
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
    else if(!isValid(req.body.fileName)){
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
    else{
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
    }
});

app.post('/delete',isAuth,(req,res) => {
    if(!req.body.fileName){
        console.log("filename_not_found : "+req.body.fileName);
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
    else if(!isValid(req.body.fileName)){
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
    else{
        jsonFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/json/"+req.body.fileName+".json");
        xlFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/"+req.body.fileName+".xlsx");
        if(fs.existsSync(xlFilePath) && fs.existsSync(jsonFilePath)){
            fs.unlinkSync(jsonFilePath);
            fs.unlinkSync(xlFilePath);
            res.redirect("/pg");
        }
        else{
            res.redirect("/pg");
        }
    }
  });

app.post('/download',isAuth,(req,res) => {
    if(!req.body.fileName){
        console.log("filename_not_found : "+req.body.fileName);
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
    else if(isValid(req.body.fileName)){
        xlFilePath = path.join(__dirname, '/'+req.session.type+req.session.pg+"/excel/"+req.body.fileName+".xlsx");
        if(fs.existsSync(xlFilePath)){
            res.status(200).download(xlFilePath, req.body.fileName+".xlsx");
        }
        else{
            res.redirect("/pg");
        }
    }
    else{
        if(!req.session.pg){
            res.redirect("/");
        }
        else{
            res.redirect("/pg");
        }
    }
});


app.get("/research", isAuth ,(req,res)=>{
    if(req.session.type == 2){
        let jss = {
            prof1 :  [
                "https://scholar.google.co.in/citations?user=we3-yw4AAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=kMEE8lAAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=XRHUphsAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=-ZxPXBcAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=KCz3sGcAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=szO6C0UAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=xkIaOFgAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=nBJ46o8AAAAJ&hl=en",
                "https://scholar.google.com/citations?user=7LgtKl8AAAAJ&hl=en",
                "https://scholar.google.com/citations?user=wPBE5eYAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=o7E_rnwAAAAJ&hl=en"
            ],
            prof2 : [
                "https://scholar.google.co.in/citations?user=RQ7irVQAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=_UHWS2oAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=czAF0sQAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=lb5kZSkAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=a3mzDVYAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=WBpPD-QAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=iQxIGk8AAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=YCIxQRIAAAAJ&hl=en",
                "https://scholar.google.be/citations?user=UfjhNCgAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=ZoYQ_YIAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=m5Q6ntwAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=-3cqe3MAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=EqomJrIAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=p-bF97QAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=Mayn7WkAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=uNpG0SoAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=swQcoyQAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=hy9kEH8AAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=8nues8UAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=5AGbmGsAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=qyGf-6sAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=djL65WYAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=EU3s-LgAAAAJ&hl=en",
                "https://scholar.google.co.in/citations?user=74jSotQAAAAJ&hl=hi",
                "https://scholar.google.com/citations?user=k78JKSoAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=6DdLqTAAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=Dfr16RgAAAAJ&hl=en",
                "https://scholar.google.com/citations?user=aHTSfIUAAAAJ&hl=en"
            ],
            prof3 : [
            ],
            prof4 : [
            ],
        };
        const parameter1 = req.query.para;
        research.getdata(jss[parameter1],res,req,parameter1);
    }
    else{
        res.redirect("/dashboard");
    }
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
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.log("someone_fked_around_where_they_should_not_have");
        res.redirect("/");
    }
    else if (err.code === 'EBADCSRFTOKEN'){
        console.log("someone_fked_with_csrf_tokens");
        res.status(403).send('CSRF Token Error');
    }
    else{
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


const PORT= process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server is running at "+PORT);
    mongoose.connect(urri)
    .then((result)=>console.log("mdb 1 passed"))
    .catch((err)=>console.log(err));
});