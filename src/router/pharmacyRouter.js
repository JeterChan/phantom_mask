const express = require('express');
const router = express.Router();
const pharmacyController = require('../controller/pharmacyController');

// api/v1/pharmacies/open?time=09:30&weekday=Mon
router.get('/open', pharmacyController.listOpenPharmacies);

// api/v1/pharmacies/:pharmacyId/masks
router.get('/:pharmacyId/masks', pharmacyController.getMasksByPharmacy);

// api/v1/pharmacies/filter-by-mask-count
router.get('/filter-by-mask-count', pharmacyController.filterPharmaciesByMask);


module.exports = router;