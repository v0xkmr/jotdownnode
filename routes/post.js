const express = require('express');
const router = express.Router();
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

//Post Details
//title --> String
//body --> String
//created on --> Date

const postSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    postBody: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 400
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', postSchema);

//Get posts with customerId
router.get('/all/:id', async (req, res) => {
    const valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        res.status(400).send(`Customer id ${req.params.id} is not valid.`);
        return;
    }
    const posts = await Post.find({ customerId: req.params.id });
    //if (posts.length === 0) {
    //    res.send('No Post created yet.');
    //    return;
    //}
    res.send(posts);
});

//Get post with id
router.get('/single/:id', async (req, res) => {
    const valid = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!valid) {
        res.status(400).send(`Post id ${req.params.id} is not valid.`);
        return;
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
        res.status(404).send(`Post with id ${req.params.id} not presnt.`);
        return;
    }
    res.send(post);
});

//Create post
router.post('/', async (req, res) => {
    const { error } = validPost(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    const post = new Post({
        customerId: req.body.customerId,
        title: req.body.title,
        postBody: req.body.postBody
    });
    const result = await post.save();
    res.send(result);
});

//Update Post
router.put('/:id', async (req, res) => {
    const { error } = validPost(req.body);
    if (error) {
        res.status(400).send(error.details[0].message);
        return;
    }
    const result = await Post.findByIdAndUpdate(req.params.id, {
        customerId: req.body.customerId,
        title: req.body.title,
        postBody: req.body.postBody
    }, { new: true });
    if (!result) {
        res.status(404).send(`Post with id ${req.params.id} not present.`);
        return;
    }
    res.send(result);
});

//Delete post with id
router.delete('/:id', async (req, res) => {
    const result = await Post.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).send(`Post with id ${req.params.id} not present.`)
        return;
    }
    res.send(result);
});

function validPost(post) {
    const schema = {
        customerId: Joi.objectId().required(),
        title: Joi.string().min(3).max(50).required(),
        postBody: Joi.string().min(3).max(400).required()
    }
    const result = Joi.validate(post, schema);
    return result;
}

module.exports.post = router;
module.exports.postModel = Post;