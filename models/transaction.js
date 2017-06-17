var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create a new schema for
// the user model
var TransactionSchema = new Schema({
  stripeCharge: Object,
  cart: Object,
  customer: Object,
  order: Array
}, {
  timestamps: true
});

TransactionSchema.statics.uniqueCustomers = function() {
  return this.aggregate([{
    $group: {
      _id: "$customer.email"
    }
  }]);
}

TransactionSchema.statics.uniqueStates = function() {
  return this.aggregate([{
    $group: {
      _id: "$customer.stateAddress"
    }
  }]);
}

TransactionSchema.statics.revenueByState = function() {
  return this.aggregate([{
      $group: {
        _id: "$customer.stateAddress",
        revenue: {
          $sum: "$stripeCharge.amount"
        }
      }
    },
    {
      $sort: {
        _id: 1
      }
    }
  ]);
}


TransactionSchema.statics.revenueByProduct = function() {
  let mr = {};
  mr.map = function() {
    let thisCart = this.cart;
    let thisOrder = this.order;
    thisOrder.forEach(function(orderItem, index, array) {
      let itemQty = 0;
      thisCart.forEach(function(cartItem, index, array) {
        if (cartItem.id.toString() === orderItem.id.toString()) {
          itemQty = cartItem.quantity;
        }
      });

      emit(orderItem.name, parseFloat(orderItem.price) * itemQty * 100);
    });
  };
  mr.reduce = function(k, vals) {
    return Array.sum(vals);
  };
  return this.mapReduce(mr);
};

TransactionSchema.statics.revenueByCategory = function() {
  let mr = {};
  mr.map = function() {
    let thisCart = this.cart;
    let thisOrder = this.order;
    thisOrder.forEach(function(orderItem, index, array) {
      let itemQty = 0;
      thisCart.forEach(function(cartItem, index, array) {
        if (cartItem.id.toString() === orderItem.id.toString()) {
          itemQty = cartItem.quantity;
        }
      });

      emit(orderItem.Category.name, parseFloat(orderItem.price) *
        itemQty * 100);
    });
  };
  mr.reduce = function(k, vals) {
    return Array.sum(vals);
  };
  return this.mapReduce(mr);
};

TransactionSchema.statics.totalUnits = function() {
  let mr = {};
  mr.map = function() {
    let cartQty = 0;
    this.cart.forEach(function(item, index, array) {
      cartQty += item.quantity;
      emit("cart", cartQty);
    });
  };
  mr.reduce = function(k, val) {
    return Array.sum(val)
  };
  return this.mapReduce(mr);
}

TransactionSchema.statics.totalRevenue = function() {
  let mr = {};
  mr.map = function() {
    emit("cart", this.stripeCharge.amount);
  };

  mr.reduce = function(k, val) {
    return Array.sum(val)
  };
  return this.mapReduce(mr);
}

// Create the model with a defined schema
var Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
