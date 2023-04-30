const bodyParser = require('body-parser')
const express = require('express')
const stripe = require('./stripe')
const session = require('express-session')
var MemoryStore = require('memorystore')(session)
var mysql = require("mysql2");
require('dotenv').config();
const app = express()

const productToPriceMap = {
    BASIC: 'price_1MyfusDNpVqGNHpWDla4DKn3',
    PRO: 'price_1Myfx5DNpVqGNHpWxjXc6SAf'
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.engine('html', require('ejs').renderFile)
app.use(session({
    saveUninitialized: false,
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000
    }),
    resave: false,
    secret: 'keyboard cat'
}))

app.get('/', async function (req, res, next) {
    res.status(200).render('login.ejs');
});

app.post('/login', async (req, res) => {
    const { email, name } = req.body;

    console.log('--- /login ---');
    console.log(email);
    console.log(name);
    /*
    console.log(process.env.host);
    console.log(process.env.username);
    console.log(process.env.password);
    console.log(process.env.database);

    var connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database
    });

    connection.connect(function (err) {
        if (err) throw err;
        connection.query("SELECT * FROM customer", function (err, result, fields) {
            if (err)
                throw err;
            console.log(result);
        });
    });
    */

    var customer;
    const customers = await stripe.getCustomerByEmail(email);
    console.log(customers);
    if (customers && customers.data) {
        if (customers.data.length == 0) {
            console.log('customer not found for this email');

            customer = await stripe.addNewCustomer(email, name);
            console.log('result of addNewCustomer: ', customer);
            //res.send('Customer created: ' + JSON.stringify(customer));
        }
        else {
            customer = customers.data[0];
        }
    } else {
        console.log('stripe.getCustomerByEmail returned null');
        // no response from strip API
        // try again
        res.redirect('/');
    }

    //const c = await stripe.getCustomerById('cus_NkAUc8MUlPpzwE');
    //console.log('result of getCustomerById: ', c);

    req.session.customerId = customer.id;
    req.session.email = email;
    req.session.name = name;
    res.redirect('/account')
});

app.get('/account', async function (req, res) {
    console.log('--- /account ---');
    console.log(req.session.customerId);
    console.log(req.session.email);
    console.log(req.session.name);
    res.render('account.ejs', {
        customerId: req.session.customerId,
        email: req.session.email,
        name: req.session.name
    });
});

app.post('/checkout', async (req, res) => {
    const selectedProduct = req.body.product;
    const customerId = req.body.customerId;
    const email = req.body.email;
    const name = req.body.name;
    console.log('--- /checkout ---');
    console.log(selectedProduct);
    console.log(customerId);
    console.log(email);
    console.log(name);

    //const customer = await stripe.getCustomerById(customerId);
    //console.log('result of getCustomerById: ', customer);

    var stripeSession;
    if (selectedProduct == 'basic') {
        stripeSession = await stripe.createCheckoutSession(customerId, productToPriceMap.BASIC);
    }
    else if (selectedProduct == 'pro') {
        stripeSession = await stripe.createCheckoutSession(customerId, productToPriceMap.PRO);
    }
    else {

    }
    console.log(stripeSession)
    res.send({ sessionId: stripeSession.id })
});

app.get('/success', (req, res) => {
    //res.send('Payment successful');
    res.redirect('http://localhost:3000');
});

app.get('/failed', (req, res) => {
    res.send('Payment failed');
});

const port = 4242
app.listen(port, () => {
    console.log(`Listening on port ${port}!`);
})
