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
    const { orderId } = req.body;

    // 1. Verify order
    const order = await Order.findById(orderId).populate("items.menuItem");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const amount = Math.round(order.totalPrice * 100); // convert to cents

    // 2. Create payment intent for this ORDER
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method_types: ["card"],     // only card
      confirm: true,                       // CAREFULLLLLLL this will change to false when we do front end , do NOT forget!!!!!!
      payment_method: "pm_card_visa",  
        metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
      // automatic_payment_methods: {
      // enabled: true,
      // allow_redirects: "never",
   // },

    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: order.totalPrice,
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
    console.error("Webhook verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

if (event.type === "payment_intent.succeeded") {
  const pi = event.data.object;
  const orderId = pi.metadata.orderId;

  try {
    const order = await Order.findById(orderId);

    if (!order) return console.error("Order not found in webhook");

    order.status = "Preparing";          // update workflow status
    order.paymentStatus = "paid";
    order.paymentMethod = "Stripe";
    order.paymentIntentId = pi.id;

    await order.save();

    // Notify via email
    const subject = new Subject();
    const emailNotifier = new EmailNotifier();
    subject.subscribe(emailNotifier);
    subject.notify({
      orderNumber: order.orderNumber,
      userEmail: pi.receipt_email || "user@example.com",
      userName: "Customer",
      status: "Paid",
    });

    console.log("Order marked as paid:", order.orderNumber);

  } catch (error) {
    console.error("Webhook order update error:", error.message);
  }
}


  res.json({ received: true });
};
