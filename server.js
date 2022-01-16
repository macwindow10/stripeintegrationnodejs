const bodyParser = require('body-parser')
const express = require('express')
const stripe = require('./stripe')
const session = require('express-session')
var MemoryStore = require('memorystore')(session)
const app = express()

const productToPriceMap = {
    BASIC: 'price_1KITvfDc3BrvOiQJu3XdQJFF'
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

app.get('/account', async function (req, res) {
    res.render('account.ejs')
});

app.post('/login', async (req, res) => {
    const { email } = req.body;
    const customer = await stripe.addNewCustomer(email);
    //res.send('Customer created: ' + JSON.stringify(customer));
    req.session.customerID = customer
    req.session.email = email;
    res.redirect('/account')
});

app.post('/checkout', async (req, res) => {
    const { customer } = req.session
    const session = await stripe.createCheckoutSession(customer, productToPriceMap.BASIC)
    console.log(session)
    res.send({ sessionId: session.id })
});

app.get('/success', (req, res) => {
    res.send('Payment successful');
});

app.get('/failed', (req, res) => {
    res.send('Payment failed');
});

const port = 4242
app.listen(port, () => console.log(`Listening on port ${port}!`))
