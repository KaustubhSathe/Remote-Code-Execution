import express from "express";
import helmet from "helmet";
import handlebars from "express-handlebars";
import _handlebars from "handlebars";
import path from "path";
import fs from "fs";
import {spawn,fork,exec} from "child_process";
import {allowInsecurePrototypeAccess} from "@handlebars/allow-prototype-access";
const port : string|number= process.env.PORT || 5000;
const app: express.Application = express(); 

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"../public")));
app.set("view engine","hbs");
app.set("views",path.join(__dirname,"../views"));
app.engine("hbs",handlebars({
    defaultLayout: 'layout',
    extname: 'hbs',
    layoutsDir: path.join(__dirname, '../views/layouts'),
    partialsDir: path.join(__dirname, '../views'),
    handlebars: allowInsecurePrototypeAccess(_handlebars)
}));


app.get("/",(req:express.Request,res:express.Response) => {
    res.render("index");
})

app.post("/run",async (req:express.Request,res:express.Response) => {
    console.log(req.body);
    // res.send(req.body);
    fs.writeFileSync(path.join(__dirname,`../code/${req.body.uuid}.cpp`),req.body.source_code);

    const compiler = spawn("g++",[
        path.join(__dirname,`../code/${req.body.uuid}.cpp`),
        "-o",
        path.join(__dirname,`../code/${req.body.uuid}.out`)
    ]);
    compiler.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    compiler.stderr.on('data', (data) => {
        console.log(`compile-stderr: ${String(data)}`);
        res.json(data);
    });

    compiler.on('close',(data) => {
        if (data === 0) {
          console.log("Complied Successfully");
          exec(path.join(__dirname,`../code/${req.body.uuid}.out`),{maxBuffer:1024*1024*100},(err,stdout,stderr) => {
            if(err){
              console.error(err);
              return;
            }
            // console.log(String(stdout));
            res.json(String(stdout));
            fs.unlink(path.join(__dirname,`../code/${req.body.uuid}.out`),() =>{});
            fs.unlink(path.join(__dirname,`../code/${req.body.uuid}.cpp`),()=>{});
          });
          // const executor = spawn(path.join(__dirname,`../code/${req.body.uuid}.out`));
          
          
          
        }
    });
})


app.listen(port,() => console.log(`hosting @${port}`));
