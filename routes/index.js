const express = require('express');
const router = express.Router();
const postController = require('../controller/postController');
 
router.post('/posts', postController.addPost);
router.get('/posts', postController.getAllPosts);
router.get('/posts/:id', postController.getPostById);
router.delete("/posts/:id", postController.deletePostById);
router.post('/sendEmail', postController.shareLogByMail);
router.get('/search', postController.searchPosts);
router.put('/posts/:id', postController.editPost)

router.get('/emaillist', postController.getAllEmail);
router.post("/addemails" ,postController.addmaillist)
module.exports = router;