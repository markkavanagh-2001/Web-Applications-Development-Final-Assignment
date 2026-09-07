//import express & assign new instance of express to 'app' constant
const express = require("express");
const app = express(); 
const bodyParser = require("body-parser");

// Configure app to use bodyParser middleware for handling form data
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

//Import authentication module
const auth = require('./auth1');

//Add new user as per Final Assignment brief
auth.createUser("user@123.com", "pass");

//Connect to database:
const mysql =require('mysql');

//Create a connection to mySQL database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'g00474491'
});

//Connect to database. If there is an error, send message indicating as such to console
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database : ', err);
    } else {
        console.log('Connected to the database!');
    }
});

//Serve static pages from 'pages' sub-directory in current working directory. Make 'Home.html' default page to be served.
app.use(express.static("pages", {index: "home.html"}));
//Start server and listen for incoming requests on port 3000 
app.listen(3000);


//Route to handle login form submission
app.post("/cart", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const authenticated = auth.authenticateUser(username, password);
  console.log(authenticated);
  
  // Check if authentication is successful
  if(authenticated) {
    //if succesful, print to console and load checkout page
    console.log("Authentication was successful!");
    res.render("checkout.ejs");
  } else {
    //if unsuccesful, print to console and load unseccesful login page
    console.log("Authentication was NOT successful!");
    res.render("loginFailed.ejs");
  }
  });

//Retrieve product data from database
app.get('/shop', function(req, res) {
    
    //Select everything fropm DB table row where P/N = rec number
    const partNo = req.query.rec;
    connection.query("SELECT * FROM products WHERE PN = ?", [partNo], function(err, rows, fields) 
    {
        //if there is an error in retreiving any information from the DB, let the user know through the console and the browser
        if(err)
        {
            //Output error to console.
            console.error("Error retrieving data from database: ", err);
            //Output error to browser with 500 error status code
            res.status(500).send("Error retrieving data from database");
        }
        else if(rows.length === 0) //If a row is selected with no data (i.e a non-existent P/N is selected), output error to console and browser
        {
            //output error to console
            console.error("No rows found for P/N $[partNo]");
            //output error to browser
            res.send("P/N does not exist");
        }
        else //if no error occurs, output the database data
        {
            //output the data for the chosen item to the console
            console.log("Data retreived from database!");
            console.log(rows[0].Product_Name);
            console.log(rows[0].Manufacturer);
            console.log(rows[0].Model);
            console.log(rows[0].Price);
            console.log(rows[0].Image);
            //Save EJS file variables with database data
            const prodName = rows[0].Product_Name;
            const manufacturer = rows[0].Manufacturer;
            const model = rows[0].Model;
            const price = rows[0].Price;
            const image = rows[0].Image;
            const description = rows[0].Description
            //Inject data into prodData EJS template
            res.render("prodData1.ejs", {nameProd: prodName, prodManufacturer: manufacturer, prodModel: model, prodPrice: price, prodImage: image, prodDescription: description});

        }
    }
    )
})

//Get method to load checkout page for homepage 'checkout' button
app.get('/cart', function (req, res){
    res.render("checkout.ejs");
})



