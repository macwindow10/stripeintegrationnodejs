$(document).ready(function () {

    const PUBLISHABLE_KEY = 'pk_test_51MyfjgDNpVqGNHpWG1mBp9T1Alb9RaWoWXcs4QoTn1fswxgA9BB82yTsKaiYCa8dFFPTTphxIWPzsT8H623BKFyo00WGIk9Kc0'
    const stripe = Stripe(PUBLISHABLE_KEY)
    const checkoutButton = $('#checkout-button')

    checkoutButton.click(function (event) {
        event.preventDefault();
        const product = $('input[name="product"]:checked').val()
        console.log('checkoutButton.click');
        console.log(product);
        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product: product,
                customerId: customerId,
                email: email,
                name: name
            })
        }).then((result) => result.json())
            .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
    })
})