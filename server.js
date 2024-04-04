const express=require("express");
const mysql=require("mysql")
const bodyParser = require('body-parser');
const cors=require("cors")
const app=express()
const mongoose = require("mongoose");
app.use(bodyParser.json());
const AdminQuestions =require("./models/Admin")
const adminRoute =require("./rootes/Admin");
const punycode = require('punycode/');
//mongo db database connection

const authRoute = require("./rootes/auth");
mongoose
  .connect("mongodb://0.0.0.0:27017/QUERIES")
  .then(console.log("connectd sunccesfu lly"))
  .catch((err) => console.log(err));
app.use(express.json());
app.use(cors());

//sql database connections
let activeDatabase="sailor"
const db1=mysql.createConnection({
    host :"localhost",
    user: "root",
    password:"your_new_password",
    database:activeDatabase

})
app.get('/',(re,res)=>{
    return res.json("FROM BACKEND SIDE");
})
app.post('/api/sendData', (req, res) => {
    const { value,correctanswer,database } = req.body;
    console.log(value);
    console.log(correctanswer);
    console.log(database);
    activeDatabase=database;
    console.log('Received data from frontend:', value);
  //changing database on clicking

  const db1 = mysql.createConnection({
    host :"localhost",
    user: "root",
    password:"your_new_password",
    database:activeDatabase
  });
  
  db1.connect((err) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to new database');
    }
  });

  //ending changing of the database
  //comparing two strings
    const sql2=correctanswer;
    const sql3=value;
    console.log(sql3);
    db1.query(sql2,(err,data1)=>{
    if(err) return(res.json(err.message));
    else 
     db1.query(sql3,(err,data2)=>{
    // if(err)return(res.json({success : err.message}));
    if(err)
    {
      // if(err.code === 'ER_PARSE_ERROR')
      // {
      //   return (res.json({success : "table is not found"}))
      // }
      if (err.code === 'ER_PARSE_ERROR') {
        // Extract the location of the error from the error message
        const matches = err.message.match(/near '([^']+)'/);
        const errorLocation = matches ? matches[1] : 'unknown';
        // Send a user-friendly error message to the client
        return res.status(400).json({ success: `You have an error in your SQL syntax near '${errorLocation}'. Please check your SQL query.` });
    }
      else if(err.code === 'ER_EMPTY_QUERY')
      {
        return (res.json({success : "please enter query"}))
      }
     else if (err.code === 'ER_BAD_FIELD_ERROR') {
        // Extract the problematic column from the error message
        const matches = err.message.match(/Unknown column '([^']+)'/);
        const unknownColumn = matches ? matches[1] : 'unknown';
        // Send a user-friendly error message to the client
        return res.status(400).json({ success: `column '${unknownColumn}' is not present in the database table.` });
    }

      else{
        return (res.json({success : err.message}))
      }
    }
    else{
       console.log(data2)
        try{
            
            if(JSON.stringify(data1) ===JSON.stringify(data2))
            {
                console.log('true');
                res.status(200).json({ success: "correct answer", message: 'Data received successfully', output: data2 });
            }
            else{
                
                res.json({ success: "wrong answer", message: 'Data received successfully', output: data2 });
                console.log('false');
            }
           
        }
        catch(err)
        {
            console.log('true');
           
        }
      
    }
    })
})

});
app.use("/api/auth", authRoute);
//showing all the tables from the database
app.get('/tables/:id', async (req, res) => {

//changing database 
const post = await AdminQuestions.findById(req.params.id);
console.log(post.database);
console.log(post.database);
const activeDatabase=post.database;
const db1 = mysql.createConnection({
  host :"localhost",
  user: "root",
  password:"your_new_password",
  database:activeDatabase
});

db1.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to new database');
  }
});


//ending database




    const queryTables = 'SHOW TABLES';
    console.log("database name is"+db1.config.database)
    db1.query(queryTables, (err, resultsTables) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        console.log("bhanupakash")
        const tables = resultsTables.map((row) => row[`Tables_in_${db1.config.database}`]);
        // console.log("show databases"+db1.config.database);
        console.log("the database is"+ activeDatabase)
  
        const dataPromises = tables.map((table) => {
          return new Promise((resolve, reject) => {
            const queryData = `SELECT * FROM ${table}`;
            db1.query(queryData, (err, resultsData) => {
              if (err) {
                reject(err);
              } else {
                resolve({ tableName: table, data: resultsData });
              }
            });
          });
        });
  
        Promise.all(dataPromises)
          .then((tableData) => {
            console.log("bhanuprakash",tableData);
            res.json({ tables, tableData });
          })
          .catch((error) => {
            res.status(500).json({ error: error.message });
          });
      }
    });
  });
  

//showing database
app.get('/database', (req, res) => {
    const queryTables = 'SHOW databases';
    db1.query(sql2,(err,databasedata)=>{

    })

})

//adding new admin

app.get("/api/admin/:id", async (req, res) => {
  try {
    const post = await AdminQuestions.findById(req.params.id);
    console.log(post.database);

    const newDatabase = post.database;
    //creating connection
    const activeDatabase=newDatabase;
    const db1 = mysql.createConnection({
      host :"localhost",
      user: "root",
      password:"your_new_password",
      database:activeDatabase
    });
    
    db1.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
      } else {
        console.log('Connected to new database');
      }
    });
    console.log(post.database);
  
    //ending connection

    res.status(200).json(post);
  } catch (err) {
    return res.status(404).json("question is not found");
  }
});

//ending showing of the database
app.use("/api/admin",adminRoute);
app.listen(3000,()=>{
    console.log("listening ");
})