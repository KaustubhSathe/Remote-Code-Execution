
/*--------------------------------------Editor Settings-----------------------------------------------------------*/

var editor = ace.edit("code");
editor.setTheme("ace/theme/dracula");
editor.session.setMode("ace/mode/c_cpp");
editor.setFontSize(20);
editor.setHighlightActiveLine(true);


function changeTheme(){
    let theme = document.getElementById("theme").value;
    editor.setTheme("ace/theme/" + theme);    
}


function changeFontSize(){
    let size = parseFloat(document.getElementById("fontsize").value);
    editor.setFontSize(size);
}


function changeKeyBind(){
    let bind = document.getElementById("keybind").value;
    editor.setKeyboardHandler("ace/keyboard/" + bind);
}

function changeLanguage(){
    let mode = document.getElementById("language").value;
    editor.session.setMode("ace/mode/" + mode);
}

/*--------------------------------Judge0 API-----------------------------------------------------------------*/ 
const langID = {
    "c_cpp" : 54,
    "csharp" : 51,
    "java" : 62,
    "javascript": 63,
    "python": 71,
    "golang": 60
}
function run(){
    fetch("/run",{
        "method":"POST",
        "headers":{
            "content-type":"application/json",
            "accept":"application/json"
        },
        "body" : JSON.stringify({
            "source_code": editor.getValue(),
            "language_id": langID[document.getElementById("language").value],
            "stdin": document.getElementById("inputbox").value,
            "uuid" : uuidv4(),
        })
    })
    .then(response=>response.json())
    .then(ret => {
        document.getElementById("outputbox").value = ret;
    })
    .catch((error)=>{
      console.log(error)
    })    
}


