// add an http server to serve files to the Edge browser 
// due to certificate issues it rejects the https files if they are not
// directly called in a typed URL
// express is the server that forms part of the nodejs program
var express = require('express');
var path = require("path");
var app = express();
var fs = require("fs");
//read in the file and force it to be a string by adding "" at the beginning
var configtext = "" +fs.readFileSync("/home/studentuser/certs/postGISConnection.js");
var url = require('url');

//now convert the configruation file into the correct format -i.e. a name/value pair array
var configarray = configtext.split(",");
var config = {};


for (var i = 0; i < configarray.length; i++){
    var split =  configarray[i].split(':');
    config[split[0].trim()] = split[1].trim();
}

var pg = require('pg');
var pool = new pg.Pool(config);

// adding functionality to allow cross-domain queries when PhoneGap is running a server
//app.use(function (req, res, next) {
//
//    // Website you wish to allow to connect
//    res.setHeader('Access-Control-Allow-Origin', 'http://developer.cege.ucl.ac.uk:31265');
//
//    // Request methods you wish to allow
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//
//    // Request headers you wish to allow
//    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//
//    // Set to true if you need the website to include cookies in the requests sent
//    // to the API (e.g. in case you use sessions)
//    res.setHeader('Access-Control-Allow-Credentials', true);
//    res.setHeader("Access-Control-Allow-Origin", "*");
//    next();
//
//    // Pass to next layer of middleware
//    next();
//});
//        var http = require('http');
//        var httpServer = http.createServer(app); 
//        httpServer.listen(4480);

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Origin", "http://developer.cege.ucl.ac.uk:31265/index.html");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});    

app.use(function(req, res, next) {
	res.set({
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Authorization, Origin, Accept",
            "Access-Control-Allow-Methods":"GET,PUT,POST,DELETE",
            "Access-Control-Allow-Origin":"http://developer.cege.ucl.ac.uk:31265/index.html",
            "Access-Control-Allow-Origin":"http://developer.cege.ucl.ac.uk:31265/login.html",
            "Access-Control-Allow-Origin":"http://developer.cege.ucl.ac.uk:31265",
            "Access-Control-Allow-Credentials":true,
});
        next();
});

app.get('/getGeoJSON/:tablename/:geomcolumn', function (req,res) {
	pool.connect(function(err,client,done) {
	if(err){
		console.log("not able to get connection "+ err);
		res.status(400).send(err);
	}
	var colnames = "";
	// first get a list of the columns that are in the table
	// use string_agg to generate a comma separated list that can then be pasted into the next query
	var querystring = "select string_agg(colname,',') from ( select column_name as colname ";
	querystring = querystring + " FROM information_schema.columns as colname ";
	querystring = querystring + " where table_name = '"+ req.params.tablename +"'";
	querystring = querystring + " and column_name <> '"+req.params.geomcolumn +"') as cols ";
	console.log(querystring);

	// now run the query
	client.query(querystring,function(err,result){
		//call `done()` to release the client back to the pool
		console.log("trying");
		done();
		if(err){
			console.log(err);
			res.status(400).send(err);
		}
		 for (var i =0; i< result.rows.length ;i++) {
		 console.log(result.rows[i].string_agg);
		 }
		thecolnames = result.rows[0].string_agg;
		colnames = thecolnames;
		console.log("the colnames "+thecolnames);
		// now use the inbuilt geoJSON functionality
		// and create the required geoJSON format using a query adapted from here:
		// http://www.postgresonline.com/journal/archives/267-CreatingGeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
		// note that query needs to be a single string with no line breaks so built it up bit by bit
		var querystring = " SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM ";
		querystring = querystring + "(SELECT 'Feature' As type , ST_AsGeoJSON(lg." + req.params.geomcolumn+")::json As geometry, ";
		querystring = querystring + "row_to_json((SELECT l FROM (SELECT "+colnames + ") As l )) As properties";
		querystring = querystring + " FROM "+req.params.tablename+" As lg limit 100 ) As f ";
		console.log(querystring);
		// run the second query
		client.query(querystring,function(err,result){
		//call `done()` to release the client back to the pool
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
				res.status(200).send(result.rows);
			});

		});
	});
});


app.get('/getPOI',function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
		
        //use the inbuilt geoJSON functionality
        //and create the required geoJSON format using a query adapted from here:http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
        //note that query needs to be a single string with no line breaks so built it up bit by bit
        
        var querystring  = "select 'FeatureCollection' as type, array_to_json(array_agg(f)) as features FROM ";
        querystring = querystring + "(select 'Feature' as type, st_asgeojson(lg.geom)::json as geometry, ";
        querystring = querystring + "row_to_json((select l from (select id,name,category) as l)) as properties";
		querystring = querystring + "  from united_kingdom_poi as lg limit 100) as f";
		console.log(querystring);
		
		//run the second query
		client.query(querystring,function(err,result){
			//call 'done()' to release the client back to the pool
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
		
    });
});

app.get('/postgistest', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
        client.query('select name from united_kingdom_counties',function(err,result)
        {
        done();
        if(err){
            console.log(err);
            res.status(400).send(err);
        }
        res.status(200).send(result.rows);
        });
    });
});

app.get('/SettershowQuestionData', function(req,res){
    pool.connect(function(err,client,done){
        if(err){
            console.log("not able to get connection "+ err);
            res.status(400).send(err);
        }
        //use the inbuilt geoJSON functionality
        //and create the required geoJSON format using a query adapted from here:http://www.postgresonline.com/journal/archives/267-Creating-GeoJSON-Feature-Collections-with-JSON-and-PostGIS-functions.html, accessed 4th January 2018
        //note that query needs to be a single string with no line breaks so built it up bit by bit
        
        var querystring  = "select 'FeatureCollection' as type, array_to_json(array_agg(f)) as features FROM ";
        querystring = querystring + "(select 'Feature' as type, st_asgeojson(lg.geom)::json as geometry, ";
        querystring = querystring + "row_to_json((select l from (select title,question_content,user_email) as l)) as properties";
	querystring = querystring + "  from quesionapp_question as lg limit 100) as f";
	console.log(querystring);
		
		//run the second query
		client.query(querystring,function(err,result){
			//call 'done()' to release the client back to the pool
			done();
			if(err){
				console.log(err);
				res.status(400).send(err);
			}
			res.status(200).send(result.rows);
		});
		
    });
});

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
 extended: true
}));
app.use(bodyParser.json());

app.post('/uploadData',function(req,res){
// note that we are using POST here as we are uploading data
// so the parameters form part of the BODY of the request rather than the RESTful API
    console.dir(req.body);
    pool.connect(function(err,client,done) {
    if(err){
    console.log("not able to get connection "+ err);
     res.status(400).send(err);
     } 
     var querystring = "INSERT into quesionapp_question (title,question_content,optionA,optionB,optionC,optionD,optiontrueA,optiontrueB,optiontrueC,optiontrueD,geom,user_email) values ('" + 
            req.body.title + "','" + req.body.question_content + "','" + req.body.optionA+"','" + req.body.optionB+"','" + req.body.optionC+"','" + req.body.optionD+"','" 
            + req.body.optiontrueA+"','" + req.body.optiontrueB+"','" + req.body.optiontrueC+"','" + req.body.optiontrueD+"',st_geomfromtext('POINT(" 
            + req.body.lat+" "+ req.body.lng + ")',3857),'" +req.body.user_email+ "');";
    console.log(querystring);
    client.query( querystring,function(err,result) {
    done(); 
    if(err){
    console.log(err);
    res.status(400).send(err);
    }
    res.status(200).send("Question Uploaded Success, go back to your index!");
    });
    });
});

//uploadedRegisterData is for the page register html and store the user register information into the database
app.post('/uploadRegisterData',function(req,res){
// note that we are using POST here as we are uploading data
// so the parameters form part of the BODY of the request rather than the RESTful API
    console.dir(req.body);
    pool.connect(function(err,client,done) {
    if(err){
    console.log("not able to get connection "+ err);
     res.status(400).send(err);
     } 
     var querystring = "INSERT into quesionapp_user_register (register_email,register_pass,register_username) values ('" + 
            req.body.register_email + "','" + req.body.register_pass + "','" + req.body.register_username+"')" ;
    console.log(querystring);
    client.query( querystring,function(err,result) {
    done(); 
    if(err){
    console.log(err);
    res.status(400).send(err);
    }
    res.status(200).send("You are registered!");
    });
    });
});


app.post('/QuestionAppLogin',function(req,res){
// note that we are using POST here as we are uploading data
// so the parameters form part of the BODY of the request rather than the RESTful API
    var promise = new Promise(function (resolve, reject) {
    console.dir(req.body);
    pool.connect(function(err,client,done) {
    if(err){
    console.log("not able to get connection "+ err);
     res.status(400).send(err);
     } 
     var querystring = "select * from quesionapp_user_register where register_email = '" + 
            req.body.register_email + "' and register_pass = '" + req.body.register_pass + "';"  ;
    console.log(querystring);
    client.query( querystring,function(err,result) {
        
        done(); 
        if(err){
            console.log(err);
            res.status(400).send(err);
        }
        // when the result of select has 0 row
//        else{ 
//            if(result.rows.length === 0) {
//                console.log("Wrong email or password!");
//                res.end();
//            }
//            else{
//                res.status(200).send("select query success");
//                console.log("select query success!");
//        
//                }
//            }
        rows = result.rows
        console.log("your row is: "+rows);
        }, function (err, rows){
            rownew = JSON.stringify(rows.rowCount);
            res.end(JSON.stringify(rownew));
            resolve(JSON.stringify(rownew));
            console.log("your row is: "+rownew);
        });
    });
    promise.then(function (value) {
        console.log(value);
        return value;
    }, function (value) {});
    return promise;
    });
});

app.get('/404', function(req, res){
  throw new NotFound;
});

/*
	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(__dirname + '/'+req.params.name1);
});


  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx
  app.get('/:name1/:name2', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
  console.log('request '+req.params.name1+"/"+req.params.name2);

  // the res is the response that the server sends back to the browser - you will see this text in your browser window
  res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2);
});



	// the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
	app.get('/:name1/:name2/:name3', function (req, res) {
		// run some server-side code
		// the console is the command line of your server - you will see the console.log values in the terminal window
		console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3); 
		// send the response
		res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3);
	});
  // the / indicates the path that you type into the server - in this case, what happens when you type in:  http://developer.cege.ucl.ac.uk:32560/xxxxx/xxxxx/xxxx
  app.get('/:name1/:name2/:name3/:name4', function (req, res) {
  // run some server-side code
  // the console is the command line of your server - you will see the console.log values in the terminal window
 console.log('request '+req.params.name1+"/"+req.params.name2+"/"+req.params.name3+"/"+req.params.name4); 
  // send the response
  res.sendFile(__dirname + '/'+req.params.name1+'/'+req.params.name2+ '/'+req.params.name3+"/"+req.params.name4);
});
*/

        var http = require('http');
        var httpServer = http.createServer(app); 
        httpServer.listen(4480);
        
	 //adding functionality to allow cross-domain queries when PhoneGap is running a server
//	app.use(function(req, res, next) {
//		res.setHeader("Access-Control-Allow-Origin", "*");
//		res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
//		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//                res.setHeader('Access-Control-Allow-Origin', 'http://developer.cege.ucl.ac.uk:31265');
//		next();
//	});

	
	// adding functionality to log the requests
//	app.use(function (req, res, next) {
//		var filename = path.basename(req.url);
//		var extension = path.extname(filename);
//		console.log("The file " + filename + " was requested.");
//		next();
//	});
//	



	app.get('/',function (req,res) {
		res.send("hello world from the HTTP server");
	});




