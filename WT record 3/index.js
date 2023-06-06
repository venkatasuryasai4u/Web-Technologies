const express = require('express');
const app = express();
const mysql = require('mysql');
const json2csv = require('json2csv').parse;
const body = require('body-parser');
var session = require('express-session');
const path = require('path');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(body.json());
app.use(body.urlencoded({ extended: true }));

app.use(session({ secret: 'Your_Secret_Key', resave: true, saveUninitialized: true }))
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify.html'));
});

app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'student.html'));

});
app.get('/faculty', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'faculty.html'));

});
app.get('/fine', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'fine.html'));

});
app.get('/payfine', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payfine.html'));
});

app.get('/pay', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pay.html'));

});
app.listen(4000, () => {
  console.log('Server running on port 3000');
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your database username
  password: '', // replace with your database password
  database: 'finess'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Database connection established successfully.');
});

module.exports = connection;

//verification

app.post('/verify', (req, res) => {
  var pin = req.body.password;
  console.log(req.body);
  if (pin == 7939) {
    console.log('success');
    res.redirect('/faculty');
  }
  else {
    res.send('Incorrect password');
  }
});

app.post('/faculty', (req, res) => {
  var a = req.body.rollno;
  console.log(req.body);
  req.session.user = a;
  if (req.body.submit == 1) {
    // The "add fines" button was clicked
    res.render("cart", { user: a });
  } else {
    // The "view fines" button was clicked
    res.redirect('/records');
    // res.render("cart.ejs");
  }

});
app.get('/records', (req, res) => {
  const xyz = req.session.user;
  console.log(xyz);
  const sql = "SELECT * FROM fines WHERE pinno='" + xyz + "'";

  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      return;
    }

    console.log('Data retrieved successfully');

    const orders = result.map(row => {
      return {
        items: row.item_name.split(', '), // Split the item names into an array
        total: row.total_price,
        date: new Date().toLocaleDateString(), // Get the current date in the format of MM/DD/YYYY
      };
    });
    res.render('totalfine.ejs', { orders: orders });
  });

});



app.post('/cart', (req, res) => {
  const items = req.body;
  console.log(items);
  const output = items['rollno'];
  req.session.roll = output;
  console.log(output);
  const abc = req.session.roll;
  console.log(req.session.roll);
  if (req.body.submit) {
    // The "add fines" button was clicked
    res.render("cart.ejs", { name2: output, aa: abc });
  } else if (req.body.check) {
    // The "view fines" button was clicked
    res.redirect('/records');
  }
});

app.post('/checkout', (req, res) => {
  const items = req.body;
  const itemArray = [];
  const xyz = req.session.roll;
  let total = 0;

  for (let itemName in items) {
    const price = parseInt(items[itemName]);
    total += price;

    itemArray.push({ name: itemName, price: price });
  }

  const itemsStr = itemArray.map(item => item.name).join(', ');

  const sql = `INSERT INTO fines (pinno,item_name, total_price) VALUES ('${req.session.user}','${itemsStr}', ${total})`;
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error inserting data: ' + err.stack);
      return;
    }
    console.log('Data inserted successfully');
  });

  res.render('viewfines.ejs', { itemlist: itemArray, total: total });
});




app.post('/checkpage', (req, res) => {
  const items = req.body;
  console.log(items);
  const output = items['name'];
  req.session.roll = output;
  const abc = req.session.roll;
  console.log(req.session.user);
  if (req.body.submit) {
    // The "add fines" button was clicked
    res.render("cart.ejs", { name2: output, aa: abc });
  } else if (req.body.check) {
    // The "view fines" button was clicked
    res.redirect('/records');
  }


});



app.get('/remove', (req, res) => {
  const xyz = req.session.user;
  console.log(xyz);

  const sql = "DELETE FROM `fines` WHERE pinno='" + xyz + "'";
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      return;
    }
    else {
      console.log('Data deleted  successfully');

      // res.sendFile(__dirname + '/public/faculty.html');
      res.redirect('/')

    } 
  });

});
// In your server-side code
app.post('/redirect', (req, res) => {

  res.sendFile(__dirname + '/');
});
app.post('/totalfines', (req, res) => {
  const xyz = req.body.roll;
  console.log(xyz);
  const sql = "SELECT * FROM fines WHERE pinno='" + xyz + "'";

  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error retrieving data: ' + err.stack);
      return;
    }

    console.log('Data retrieved successfully');
    const orders = result.map(row => {
      return {
        items: row.item_name.split(', '), // Split the item names into an array
        total: row.total_price,
        date: new Date().toLocaleDateString(), // Get the current date in the format of MM/DD/YYYY
      };
    });
    res.render('totalfine1.ejs', { orders: orders });

  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
