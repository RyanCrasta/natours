const express = require('express');
const authController = require('./../controllers/authController');

const reviewController = require('./../controllers/reviewController.js');

const router = express.Router({ mergeParams: true });

// nested route
// POST /tour/tourkaID/reviews

// get all reviews of specific tour
// GET /tour/tourkaID/reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .get(reviewController.getAReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
