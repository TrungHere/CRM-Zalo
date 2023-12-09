const router = require("express").Router();
const formData = require("express-form-data");
const Controllers = require("../../../controllers/crm/Marketing/ZaloLogin");
const functions = require("../../../services/functions")

//Login Zalo
router.post('/getPermission', 
            // functions.checkToken,
            formData.parse(), 
            Controllers.getPermission);

//phân quyền - lấy token
router.post('/getToken', 
            functions.checkToken,
            formData.parse(), 
            Controllers.getToken);

//danh sách tin nhắn gần nhất 
router.post('/getListMessage', 
            functions.checkToken,
            formData.parse(), 
            Controllers.getListMessage);

//danh sách 1 cuộc hội thoại 
router.post('/get1ListMessage', 
            functions.checkToken,
            formData.parse(), 
            Controllers.get1ListMessage);

//danh sách người dùng quan tâm
router.post('/getListUserCare', 
            functions.checkToken,
            formData.parse(), 
            Controllers.getListUserCare);

//Ktra id zalo
router.post('/checkID', 
            formData.parse(), 
            Controllers.checkID);

//gửi tin nhắn văn bản
router.post('/sendMessageText', 
            functions.checkToken,
            formData.parse(), 
            Controllers.sendMessageText);
            
//gửi tin nhắn kèm hình ảnh
router.post('/sendMessageWithIMG', 
            functions.checkToken,
            formData.parse(), 
            Controllers.sendMessageWithIMG);

//gửi tin nhắn kèm hình ảnh         
router.post('/sendMessageWithIMG', 
            functions.checkToken,
            formData.parse(), 
            Controllers.sendMessageWithIMG);

//gửi tin nhắn theo mẫu kèm hình ảnh     
router.post('/sendMessageWithImgV2', 
            functions.checkToken,
            formData.parse(), 
            Controllers.sendMessageWithImgV2);

//connect webhook   
router.post('/webhook', 
            functions.checkToken,
            formData.parse(), 
            Controllers.webhook);

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
router.post('/testAPIfb', 
            // functions.checkToken, 
            formData.parse(), 
            Controllers.testAPIfb);

module.exports = router;