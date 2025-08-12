const express = require('express');
const router = express.Router();
const authenticate  = require('../middleware/authMiddleware');
const {contactUs} = require('../controllers/customer/contactController')
const {reservations} = require('../controllers/reservations/reservationsController')
const {getTakeawayMenu} = require('../controllers/customer/takeAwayController')
const {addToCart, getAddToCart, removeFromCart, updateCartItem} = require('../controllers/customer/cartController')   
const {placeOrder, myOrders} = require('../controllers/customer/orderController')
const {getDiningMenu } = require('../controllers/customer/diningController'); // Place order
const {getDrinksMenu } = require('../controllers/customer/drinksController'); // Place order
const {getGalleryItems } = require('../controllers/customer/galleryController'); // Place order

router.post('/contact_us',authenticate, contactUs); // Contact customer
router.post('/reservations',authenticate, reservations); // Make reservation
router.get('/takeaway', getTakeawayMenu ) // Get takeaway menu
router.get('/dining', getDiningMenu ) // Get takeaway menu
router.get('/drinks', getDrinksMenu ) // Get takeaway menu


// cart sections
router.post('/cart',authenticate, addToCart ) // Add new item to cart
router.get('/cart',authenticate, getAddToCart ) // Get all items in cart
router.delete('/cart/:cart_id',authenticate, removeFromCart ) // Remove item from cart
router.put('/cart/:cart_id',authenticate, updateCartItem  ) // Update quantity of an item in cart

// router.put('/cart/:item_id',authenticate, updateCart )


// CheckOut/ Place order sections 
router.post('/orders', authenticate, placeOrder ) // Place order
router.get('/orders/my', authenticate, myOrders ) // Place order


// Get Gallery Items
router.get('/getGalleryItems', getGalleryItems)

module.exports = router