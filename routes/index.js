const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const placeController = require('../controllers/placeController');
const siteController = require('../controllers/siteController');
const eventController = require('../controllers/eventController');

const {catchErrors} = require('../handlers/errorHandlers');
// Do work here
router.get('/', authController.loginIsOptional, catchErrors(placeController.getPlaces));
router.get('/places', authController.loginIsOptional, catchErrors(placeController.getPlaces));
router.get('/places/page/:page',  catchErrors(placeController.getPlaces));
router.get('/places/:region',  catchErrors(placeController.getPlaces));
router.get('/places/:region/page/:page',  catchErrors(placeController.getPlaces));


router.get('/places/:id/edit',authController.isLoggedIn, catchErrors(placeController.editPlace));

//New place create and edit stuff...
router.get('/places/new/location',authController.isLoggedIn, placeController.findNewPlace);
router.post('/places/new/details', authController.isLoggedIn,placeController.enterNewPlaceDetails);
router.post('/places/new/save',authController.isLoggedIn, catchErrors(placeController.createNewPlace));

router.get('/places/:id/editDetails',authController.isLoggedIn, catchErrors(placeController.editPlaceDetails));
router.post('/places/:id/editDetails',authController.isLoggedIn, catchErrors(placeController.savePlaceDetails));

router.get('/places/:id/editLocation',authController.isLoggedIn, catchErrors(placeController.editPlaceLocation));
router.post('/places/:id/editLocation',authController.isLoggedIn, catchErrors(placeController.savePlaceLocation));

//end new create and edit stuff
router.get('/place/:slug', catchErrors(placeController.displayPlace));
router.get('/:lang/place/:slug', catchErrors(placeController.displayPlace));

router.get('/api/places/near', catchErrors(placeController.mapPlaces));

router.get('/about', siteController.about);
router.get('/help/:what', siteController.help);

router.get('/admin/manage', authController.isLoggedIn, siteController.management);
router.post('/admin/manage',authController.isLoggedIn, catchErrors( siteController.runManagementAction));


router.get('/events-add', authController.isLoggedIn, eventController.addEvent);
router.post('/events-add', authController.isLoggedIn, eventController.createEvent);
router.post('/events-add/:id', authController.isLoggedIn, eventController.createEvent);
router.get('/events',catchErrors(eventController.getEventList));

router.get('/login', userController.loginForm);
router.post('/login', authController.loginNew);


router.get('/register', userController.registerUserForm);
router.post('/register', 
    userController.validateRegister,
    catchErrors(userController.registerUser),
    authController.login
    );

router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account',authController.isLoggedIn, catchErrors( userController.updateAccount));

router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
    authController.confirmedPasswords, 
    catchErrors(authController.updatePassword));


router.get('/map', storeController.mapPage);

//old stuff after this
router.get('/tags/', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));
router.get('/hearts', authController.isLoggedIn,catchErrors(storeController.hearts));

router.post('/reviews/:id', 
    authController.isLoggedIn,
    catchErrors(reviewController.addReview));

router.get('/top', storeController.getTopStores);

//API endpoints

router.get('/api/search', catchErrors(storeController.searchStores));

router.post('/api/stores/:id/heart', catchErrors(storeController.heartStore));
module.exports = router;
