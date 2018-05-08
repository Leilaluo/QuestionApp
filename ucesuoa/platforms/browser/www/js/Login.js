function QuestionApp_user_Login(){
    alert ("Start Login!");
    var register_email = document.getElementById("login_email").value;
    var register_pass = document.getElementById("login_password").value;
    if(register_email === "" || register_pass === ""){
    alert("Please input email and password!");
    }
    else{
    var postString = "register_email="+register_email +"&register_pass="+register_pass;
    processData(postString);

    
//    alert("lalala",b);
    }
}

        
var client;

function processData(postString) {
 client = new XMLHttpRequest();
 alert("stage 1");
 client.open('POST','http://developer.cege.ucl.ac.uk:30265/QuestionAppLogin',true);
 client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
 client.onreadystatechange = dataUploaded; 
 client.send(postString);
}


// create the code to wait for the response from the data server, and process the response once it is received
function dataUploaded() {
 // this function listens out for the server to say that the data is ready - i.e. has state 4
 if (client.readyState == 4) {
 // change the DIV to show the response
  document.getElementById("dataUploadResult").innerHTML = client.responseText;
  getResult();

 }
}

function getResult(){
    result = document.getElementById("dataUploadResult").textContent;
    if (result == '"0"')
    {
        alert("There are something wrong with your email or password!\nPlease login again!")
        window.location.href = "./login.html"
    }
    else 
    {
        if (result == '"1"'){
        var user_email = document.getElementById("login_email").value;
        url= "index.html?email="+escape(user_email);
        alert("Login success!")
        window.location.href = url;
        }
}}
