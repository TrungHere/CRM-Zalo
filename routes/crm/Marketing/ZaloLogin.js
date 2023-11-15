const router = require("express").Router();
const formData = require("express-form-data");
const Controllers = require("../../../controllers/crm/Marketing/ZaloLogin");
const functions = require("../../../services/functions")

//Login Zalo
router.post('/Strategy', 
            // functions.checkToken,
            formData.parse(), 
            Controllers.Strategy);
router.post('/getInfoUserAndFriend', 
            // functions.checkToken, 
            formData.parse(), 
            Controllers.getInfoUserAndFriend);
router.post('/takeLatLong', 
            // functions.checkToken, 
            formData.parse(), 
            Controllers.takeLatLong);
router.post('/takeAddress', 
            // functions.checkToken, 
            formData.parse(), 
            Controllers.takeAddress);
router.post('/testAPIkey', 
            // functions.checkToken, 
            formData.parse(), 
            Controllers.testAPIkey);

module.exports = router;