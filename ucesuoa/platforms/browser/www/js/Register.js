function user_register(){
    alert ("Start Register!");
    var register_email = document.getElementById("register_email").value;
    var register_pass = document.getElementById("register_pass").value;
    var register_username = document.getElementById("register_username").value;
    var postString = "register_email="+register_email +"&register_pass="+register_pass+"&register_username="+register_username;
    processData(postString);
}

var client;

function processData(postString) {
 client = new XMLHttpRequest();
 client.open('POST','http://developer.cege.ucl.ac.uk:30265/uploadRegisterData',true);
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
    url= "index.html?email="+escape(document.getElementById("register_email").value);
    alert("Successful registered!");
    alert("useremail: "+document.getElementById("register_email").value);
    window.location.href = url;
 }
}

