const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Order = require("../models/order");
const MenuItem = require("../models/menuItem");

// Observer pattern
const { Subject } = require("../observers/observer");
const EmailNotifier = require("../observers/emailNotifier");

/**
 * Create Stripe PaymentIntent
 * POST /api/payments/create-payment-intent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { items } = req.body;

    // Verify items & calculate total
    const verifiedItems = await Promise.all(
      items.map(async (item) => {
        const product = await MenuItem.findById(item.menuItem);
        if (!product) throw new Error(`Menu item not found: ${item.menuItem}`);
        return {
          menuItem: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      })
    );

    const totalPrice = verifiedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Stripe uses cents
      currency: "usd",
      metadata: {
        userId: req.user._id.toString(),
        items: JSON.stringify(items), // needed for webhook
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: totalPrice,
    });
  } catch (error) {
    console.error("Stripe PaymentIntent Error:", error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Stripe Webhook to create order after payment succeeds
 * POST /api/payments/webhook
 */
exports.webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const userId = pi.metadata.userId;
    const items = JSON.parse(pi.metadata.items);

    try {
      // Verify items & calculate total
      const verifiedItems = await Promise.all(
        items.map(async (item) => {
          const product = await MenuItem.findById(item.menuItem);
          return {
            menuItem: product._id,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      const totalPrice = verifiedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const shortId = Math.floor(1000 + Math.random() * 9000);

      const newOrder = new Order({
        user: userId,
        items: verifiedItems,
        totalPrice,
        paymentMethod: "Stripe",
        orderNumber: `ORD-${shortId}`,
        status: "Pending",
      });

      await newOrder.save();

      // Observer / Email
      const orderCreated = new Subject();
      const emailNotifier = new EmailNotifier();
      orderCreated.subscribe(emailNotifier);
      orderCreated.notify({
        orderNumber: newOrder.orderNumber,
        userEmail: pi.receipt_email || "user@example.com",
        userName: "Customer",
        status: "Created",
      });

      console.log("Order created via Stripe webhook:", newOrder.orderNumber);
    } catch (error) {
      console.error("Error creating order from webhook:", error);
    }
  }

  res.json({ received: true });
};
