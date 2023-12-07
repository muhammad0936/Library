const Borrowing = require('../models/borrowing');
const Customer = require('../models/customer');
const Sales = require('../models/sales');

module.exports = async() => {
    try{
    const expiredBorrowings = await Borrowing.find({lastReturnDate: {$lt: Date.now()}}).populate(['product', 'order']);
    expiredBorrowings.forEach(async b => {
        const oldProductInfo = b.order.products.find(p => {
            return p.product.toString() === b.product._id.toString() 
        });
        // take the old price, coz the price maybe changed.
        const soldPrice = oldProductInfo.price;
        if(soldPrice < b.product.price)
        {
            const customer = await Customer.findById(b.customer);
            if(b.product.price)
            customer.fine+= b.product.price - soldPrice;
            await customer.save();
            console.log(customer)
            console.log('A fine adde to a customer.');
        }
        const sold = new Sales({
            product: b.product._id,
            order: b.order._id,
            soldPrice: b.product.price,
            quantity: b.quantity,
            customer: b.customer
        });
        await sold.save();
        await Borrowing.findByIdAndRemove(b._id);
        console.log('moving borrowed products to sales.')
    });
}catch(error){
    if(!error.statusCode)
        error.statusCode = 500;
}
}