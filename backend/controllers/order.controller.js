import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import stripe from 'stripe'


export const placeOrderCOD = async (req,res) => {
    try{
        const userId = req.user;
        const { items, address} = req.body;
        if(!items || !address){
            return res.status(400)
            .json({ message: "Items and address are required", success: false})
        }
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;

        }, 0);

        //Add tex 2%
        amount += Math.floor((amount *2)/100);
        await Order.create({
            userId,
            items,
            address,
            amount,
            paymentType: "COD",
            isPaid: false,
        });
        res.status(201).json({
            message: "Order placed successfully", success:true
        });

    } catch (error){
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal server error"});
    }
};

//stripe used
export const placeOrderStripe = async (req,res) => {
    try{
        const userId = req.user;
        const { items, address} = req.body;
        const {origin} = req.headers
        if(!items || !address){
            return res.status(400)
            .json({ message: "Items and address are required", success: false})
        }
        let productData = [];
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
              name:product.name,
              price:product.offerPrice,
              quantity:item.quantity,
            })
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        //Add tex 2%
        amount += Math.floor((amount *2)/100);
        await Order.create({
            userId,
            items,
            address,
            amount,
            paymentType: "Online",
            isPaid: true,
        });

        //stripe getway
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        //create line item for stripe

        const line_items = productData.map((item) => {
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.name,
              },
              unit_amount: Math.floor(item.price * item.price * 0.02) *100,
            },
            quantity: item.quantity,
          };
        });

        //create session
         const session = await stripeInstance.checkout.sessions.create({
          line_items,
          mode: "payment",
          success_url: `${origin}/loader?next=my-orders`,
          cancel_url: `${origin}/cart`,
          metadata:{
            orderId: Order._id,
            userId,
          },
         });

        res.status(201).json({
            message: "Order placed successfully", success:true,
            url: session.url,
        });

    } catch (error){
        console.error("Error placing order:", error);
        res.status(500).json({ message: "Internal server error"});
    }
};

//order details
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all orders for admin :/api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};