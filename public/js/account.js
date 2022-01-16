$(document).ready(function () {

    const PUBLISHABLE_KEY = 'pk_test_51KI6TUDc3BrvOiQJ0mX8m9SU9LJ6H1cZ07prTpR2vAXJIZblvMcXHDUdITCX8RzIOuoTAmZDqhlXtxOeiOr8RaCl00eSNSA4Zh'
    const stripe = Stripe(PUBLISHABLE_KEY)
    const checkoutButton = $('#checkout-button')

    checkoutButton.click(function () {
        const product = $('input[name="product"]:checked').val()

        fetch('/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                product
            })
        }).then((result) => result.json())
            .then(({ sessionId }) => stripe.redirectToCheckout({ sessionId }))
    })
})