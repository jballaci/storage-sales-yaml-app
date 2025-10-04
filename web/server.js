const express = require('express');
const fs = require('fs');
const yaml = require('js-yaml');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(express.json());

function loadProducts() {
  const doc = yaml.load(fs.readFileSync('./app/config/products.yml', 'utf8'));
  return doc.products || [];
}

app.get('/products', (req, res) => {
  res.json(loadProducts());
});

// Create a Stripe Checkout session for a product id
app.post('/create-checkout', async (req, res) => {
  const { product_id } = req.body;
  const product = loadProducts().find(p => p.id === product_id);
  if(!product) return res.status(404).json({ error: 'not found' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: product.period === 'yearly' ? 'subscription' : 'payment',
    line_items: [{
      price_data: {
        currency: product.currency.toLowerCase(),
        product_data: { name: product.title },
        unit_amount: product.price_cents,
      },
      quantity: 1,
    }],
    success_url: `${process.env.HOST}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.HOST}/cancel`,
  });

  res.json({ url: session.url });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('listening', port));
