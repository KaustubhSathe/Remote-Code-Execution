import express from "express";
import helmet from "helmet";
import handlebars from "express-handlebars";
import _handlebars from "handlebars";
import path from "path";
import fs from "fs";
import {spawn} from "child_process";
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

app.post("/run",(req:express.Request,res:express.Response) => {
    console.log(req.body);
    // res.send(req.body);
    fs.writeFileSync(path.join(__dirname,"../code/program.cpp"),req.body.source_code);

    const compiler = spawn("g++",[
        path.join(__dirname,"../code/program.cpp"),
        "-o",
        path.join(__dirname,"../code/program.out")
    ]);
    compiler.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    compiler.stderr.on('data', (data) => {
        console.log(`compile-stderr: ${String(data)}`);
        res.send(data);
    });

    compiler.on('close', (data) => {
        if (data === 0) {
          console.log("Complied Successfully");
          const executor = spawn(path.join(__dirname,"../code/program.out"));
          executor.stdout.on('data', (output) => {
            console.log(String(output));
          });
          executor.stderr.on('data', (output) => {
            console.log(`stderr: ${String(output)}`);
          });
          executor.on('close', (output) => {
            console.log(`stdout: ${output}`);
          });
        }
    });
})


app.listen(port,() => console.log(`hosting @${port}`));
