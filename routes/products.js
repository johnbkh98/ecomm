const express = require('express');
const productsRepo = require('../Repositories/products');
const producstIndexTemplate = require('../views/products/index');

const router = express.Router();

router.get('/', async(req, res) => {
    const products = await productsRepo.getAll();
    res.send(producstIndexTemplate({ products }));
});

module.exports = router;