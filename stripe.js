const stripe = require('stripe')

const STRIPE_SECRET_KEY = 'sk_test_51MyfjgDNpVqGNHpW9graqNKzzubfzGPrmjLIiH7dFWY6JDM1O5qzRzPSfM8a1kIMiwmwUVTpJof0lqgsYrbjrem4009F46IHfo'

const Stripe = stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2020-08-27'
})

const addNewCustomer = async (email, name) => {
    const customer = await Stripe.customers.create({
        email: email,
        name: name,
        description: name
    })
    return customer;
}

const getCustomerById = async (id) => {
    const customer = await Stripe.customers.retrieve(id)
    return customer
}

const getCustomerByEmail = async (email) => {
    const customer = await Stripe.customers.list({ email: email })
    return customer
}

const createCheckoutSession = async (customer, price) => {
    const session = await Stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer,
        line_items: [
            {
                price,
                quantity: 1
            }
        ],
        subscription_data: {
            trial_period_days: 14
        },

        success_url: `http://localhost:4242/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:4242/failed`
    })

    return session;
}

module.exports = {
    addNewCustomer,
    getCustomerById,
    getCustomerByEmail,
    createCheckoutSession
}