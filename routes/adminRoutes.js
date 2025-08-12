const express = require('express');
const router = express.Router();
const authenticate  = require('../middleware/authMiddleware')
const { getTakeawayCatogories, createTakeAwayMenu } = require('../controllers/admin/takeAwayController');
const { getDiningCatogories, createDiningMenu } = require('../controllers/admin/diningController');
const { getDrinksCatogories, createDrinksMenu } = require('../controllers/admin/drinksController.js');
const { getDashboardData } = require('../controllers/admin/dashboardController.js');
const { getAllUserDetails, toggleUserStatus } = require('../controllers/admin/manageUserController.js');
const { addGalleryImage } = require('../controllers/admin/galleryController');

// Takeaway routes
router.get('/getTakeawayCatogories',authenticate, getTakeawayCatogories)
router.post('/createTakeAwayMenu',authenticate, createTakeAwayMenu)

// Dining routes
router.get('/getDiningCatogories',authenticate, getDiningCatogories)
router.post('/createDiningMenu',authenticate, createDiningMenu)

// Drinks routes
router.get('/getDrinksCatogories',authenticate, getDrinksCatogories)
router.post('/createDrinksMenu',authenticate, createDrinksMenu)
router.post('/createDrinksMenu',authenticate, createDrinksMenu)

// dashboard 
router.get('/dashboard', authenticate, getDashboardData)

// User management routes
router.get('/getAllUserDetails', authenticate, getAllUserDetails)
router.put("/toggleUserStatus/:user_id", toggleUserStatus);

// Gallery routes
router.post('/gallery/add', authenticate, addGalleryImage)

module.exports = router;