
function getvaluefrom_URL(){
    var url=location.search,obj={};

    if(url.indexOf("?")!=-1)
    {
        var str = url.substr(1);
        strs= str.split("&");
        for(var i=0;i<strs.length;i++)
        {
            obj[strs[i].split("=")[0]]=unescape(strs[ i].split("=")[1]);
        }
}
return [obj.latlong,obj.email];
}
var user_email = getvaluefrom_URL()[1];

function QuestionSubmittion(){
    alert ("Start Data Upload!");
    var LatLong = getvaluefrom_URL()[0];
    var coord = LatLong.toString().split(',');
    var lat = coord[0].split('(')[1];
    var lng = coord[1].split(')')[0];
    var TrueAnswer = AnswerSetting();
    var title = document.getElementById("QuestionTitle").value;
    var question_content = document.getElementById("QuestionContent").value;
    var optionA = document.getElementById("QuestionOptionA").value;
    var optionB = document.getElementById("QuestionOptionB").value;
    var optionC = document.getElementById("QuestionOptionC").value;
    var optionD = document.getElementById("QuestionOptionD").value;
    alert(title + " "+ question_content + " "+optionA+ " "+optionB+ " "+optionC+ " "+optionD+ " "+LatLong + " "+TrueAnswer+ " "+user_email);  
    var postString = "title="+title +"&question_content="+question_content+"&optionA="+optionA+"&optionB="+optionB+"&optionC="+optionC+"&optionD="+optionD
    +"&optiontrueA="+TrueAnswer[0]+"&optiontrueB="+TrueAnswer[1]+"&optiontrueC="+TrueAnswer[2]+"&optiontrueD="+TrueAnswer[3]+"&lat="+lng+"&lng="+lat+"&user_email="+user_email;
    processData(postString);
}

var client;

function processData(postString) {
 client = new XMLHttpRequest();
 client.open('POST','http://developer.cege.ucl.ac.uk:30265/uploadData',true);
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
    url= "index.html?email="+escape(user_email);
    alert("Question add success!")
    window.location.href = url;
 }
}


function AnswerSetting() {
      var isCheckedA = document.getElementById("checkbox1").checked;
      var isCheckedB = document.getElementById("checkbox2").checked;
      var isCheckedC = document.getElementById("checkbox3").checked;
      var isCheckedD = document.getElementById("checkbox4").checked;
      var TrueAnswer = [isCheckedA,isCheckedB,isCheckedC,isCheckedD];
      alert(TrueAnswer);
      return TrueAnswer;
    }
    
function gobacktoindex(){
    url= "index.html?email="+escape(user_email);
    alert("Go Back to index now!")
    window.location.href = url;
}