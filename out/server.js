"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const handlebars_1 = __importDefault(require("handlebars"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
const allow_prototype_access_1 = require("@handlebars/allow-prototype-access");
const port = process.env.PORT || 5000;
const app = express_1.default();
app.use(helmet_1.default());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
app.set("view engine", "hbs");
app.set("views", path_1.default.join(__dirname, "../views"));
app.engine("hbs", express_handlebars_1.default({
    defaultLayout: 'layout',
    extname: 'hbs',
    layoutsDir: path_1.default.join(__dirname, '../views/layouts'),
    partialsDir: path_1.default.join(__dirname, '../views'),
    handlebars: allow_prototype_access_1.allowInsecurePrototypeAccess(handlebars_1.default)
}));
app.get("/", (req, res) => {
    res.render("index");
});
app.post("/run", async (req, res) => {
    console.log(req.body);
    // res.send(req.body);
    fs_1.default.writeFileSync(path_1.default.join(__dirname, `../code/${req.body.uuid}.cpp`), req.body.source_code);
    const compiler = child_process_1.spawn("g++", [
        path_1.default.join(__dirname, `../code/${req.body.uuid}.cpp`),
        "-o",
        path_1.default.join(__dirname, `../code/${req.body.uuid}.out`)
    ]);
    compiler.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    compiler.stderr.on('data', (data) => {
        console.log(`compile-stderr: ${String(data)}`);
        res.json(data);
    });
    compiler.on('close', (data) => {
        if (data === 0) {
            console.log("Complied Successfully");
            child_process_1.exec(path_1.default.join(__dirname, `../code/${req.body.uuid}.out`), { maxBuffer: 1024 * 1024 * 100 }, (err, stdout, stderr) => {
                if (err) {
                    console.error(err);
                    return;
                }
                // console.log(String(stdout));
                res.json(String(stdout));
                fs_1.default.unlink(path_1.default.join(__dirname, `../code/${req.body.uuid}.out`), () => { });
                fs_1.default.unlink(path_1.default.join(__dirname, `../code/${req.body.uuid}.cpp`), () => { });
            });
            // const executor = spawn(path.join(__dirname,`../code/${req.body.uuid}.out`));
        }
    });
});
app.listen(port, () => console.log(`hosting @${port}`));
