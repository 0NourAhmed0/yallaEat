const { Observer } = require('./observer');
const nodemailer = require('nodemailer');

class EmailNotifier extends Observer {
    constructor() {
        super();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async update(order) {
        let subject, text, html;

        if (order.status === "Created") {
            subject = `Order #${order.orderNumber} Placed Successfully`;
            text = `Hello ${order.userName},\n\nYour order #${order.orderNumber} has been placed successfully.\n\nThank you!`;
            html = `<p>Hello ${order.userName},</p>
                    <p>Your order <strong>#${order.orderNumber}</strong> has been placed successfully.</p>
                    <p>the estimated ready time:#${order.estimatedReadyTime} minutes , the total price is #${order.totalPrice}</p>
                    <p>Thank you!</p>`;
        } else if (order.status === "Ready") {
            subject = `Your Order #${order.orderNumber} is Ready!`;
            text = `Hello ${order.userName},\n\nYour order #${order.orderNumber} is ready for pickup.\n\nThank you!`;
            html = `<p>Hello ${order.userName},</p>
                    <p>Your order <strong>#${order.orderNumber}</strong> is ready for pickup.</p>
                    <p>Thank you!</p>`;
        } else if (order.status === "Cancelled") {
            subject = `Your Order #${order.orderNumber} has been Cancelled`;
            text = `Hello ${order.userName},\n\nWe're sorry! Your order #${order.orderNumber} has been cancelled.\n\nThank you!`;
            html = `<p>Hello ${order.userName},</p>
                    <p>Your order <strong>#${order.orderNumber}</strong> has been cancelled.</p>
                    <p>Thank you!</p>`;
        } else {
            return; // no email for other statuses
        }

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: order.userEmail,
                subject,
                text,
                html
            });
            console.log(`Email sent for order ${order.orderNumber} with status ${order.status}`);
        } catch (err) {
            console.error(`Failed to send email for order ${order.orderNumber}:`, err);
        }
    }
}

module.exports = EmailNotifier;
