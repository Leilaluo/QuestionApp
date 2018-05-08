//this page is written for the index.html
//function getemailfrom_URL design for the store the email of user from the URL(as it could be stored into the answer database)
function getemailfrom_URL(){
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

    return obj.email;
}
//user_email store the email of this user
var user_email = getemailfrom_URL()
//change the email name of the user in the index
document.getElementById("span_user_email").innerHTML = user_email;
// function getLocation and getPosition are all based on the reference from the the tutorial of this module.
function getLocation() {
    alert('Getting location...');
    navigator.geolocation.getCurrentPosition(getPosition);
}

function getPosition(position) {
    L.marker([position.coords.latitude,position.coords.longitude]).addTo(mymap).bindPopup("<b>Hello world!</b><br/>I am your position."
        +"<dt>This is the postion: </dt>"
        +"("+position.coords.latitude + "," + position.coords.longitude + ")"
        ).openPopup();
    mymap.setView([position.coords.latitude,position.coords.longitude],20);
}


//the reference of this function is in the tutorial of this module
function replaceGraphs(){
    document.getElementById("graphdiv").innerHTML ="<img src='images/ucl.png'>"
    scrollto('contactme');
}

//create a variable for each of the layer we want to load/remove
//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions can use the some varaible
var client;

//create two different type marker, this part is created based on the reference from week 2 tutorial of this module
var testMarkerRed = L.AwesomeMarkers.icon({
    icon: 'play',
    markerColor: 'red'
});
        
var testMarkerPink = L.AwesomeMarkers.icon({
    icon: 'play',
    markerColor: 'pink'
});
        
//function getData,dataResponse,loadLayer are created based on the reference from the tutorial of this module, the functions allow user to show their questions on the map
//create the code to get the data using an XMLHttpRequest
function getData(layername){
    client = new XMLHttpRequest();          
    //depending on the layername we get differnet URLs
    var url;
    if (layername == "question_map"){
        //the detail of this url setting is in httpServer.js
        url = "http://developer.cege.ucl.ac.uk:30265/SettershowQuestionData"
    }
    client.open('GET',url);
    client.onreadystatechange = dataResponse;
    client.send();
}
// create the code to wait for the response from the data server, and process the response once it is received
function dataResponse(){
    // this function listens out for the server to say that the data is ready - i.e. has state 4
    if(client.readyState==4){
        // once the data is ready, process the data
        var geoJSONData = client.responseText;
        loadLayer(geoJSONData);
    }
}
       
// convert the received data - which is text - to JSON format and add it to the map
function loadLayer(geoJSONData){
    if (geoJSONData.indexOf("user_email")>0){
        var loadingQuestions = true;
    }
    //convert the text to JSON
    var json = JSON.parse(geoJSONData);
           
    //add the JSON layer onto the map - it will appear using the testMarkerRed icon
    if (loadingQuestions == true){
        questionlayer = L.geoJson(json,{
            pointToLayer: function(feature,latlng)
                {
                    var user_email_page = getemailfrom_URL();
                    if (feature.properties.user_email === user_email_page){
                        return L.marker(latlng,{icon:testMarkerRed}).bindPopup("<dt>I am your question :) </dt>"+"<dt>Title: </dt>"+feature.properties.title
                            +"<dt>Question content: </dt>"+ feature.properties.question_content+"<dt></dt>");
                    }
                    
                }
        }).addTo(mymap)
        mymap.fitBounds(questionlayer.getBounds());
    }
}

//make sure that there is a variable for the earthquake layer to be referenced by 
//this should be GLOBAL - i.e. not inside a function - so that any code can see the varible
var questionlayer;
//create a variable that will hold the XMLHttpRequest() - this must be done outside a function so that all the functions can use the some varaible
var client;

//function removeData remove the layer from the map (reference: tutorial of this module)
function removeData(layername){
    if (layername == "questionlayer") {
        alert ("remove the question layer here!");
        mymap.removeLayer(questionlayer);
    }
            
}

//function eqChanged control the open and close of the whole question layer
function eqChanged(checkboxElem) {
  if (checkboxElem.checked) {
    getData('question_map');
  } else {
    removeData('questionlayer');
  }
}

// function changetoLogin is for user to log out or change the account
function scrollto(m){
    document.getElementById(m).scrollIntoView()
}

//function addPointonMap allows user to click on the map and add a marker of question
//define m and Questionlatlng before to store them later
var m;
var Questionlatlng;
function addPointonMap(){
    getLocation();
    alert ("Click on the map to start add a question!")
    mymap.on('click', function(event) {
    if (m != null)  mymap.removeLayer(m);
    m = L.marker(event.latlng).addTo(mymap);
    m.getLatLng();
    Questionlatlng = m.getLatLng()
});
}

// function changetoLogin is for user to log out or change the account
function changetoLogin(){
    window.location.href = "./login.html"
}

//function addQuestion lead users to the AddQuestion.html page(and include the user email and cooridinate information in the url)
function addQuestion(){
    alert ("Your question sitation is setted as: "+ Questionlatlng);
    if (confirm("Are you sure about this location?")) 
    {
        url= "AddQuestion.html?latlong="+escape(Questionlatlng)+"&email="+escape(user_email);
        window.location.href = url
    }
    
}