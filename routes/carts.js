const express = require('express');
const carts = require('../Repositories/carts');
const cartsRepo = require('../Repositories/carts');
const productsRespo = require('../Repositories/products');
const cartShowTemplate = require('../views/carts/show');

const router = express.Router();

// recieve post re to add item to cart
router.post('/cart/products', async(req, res) => {
    //figure out the cart for user

    let cart
    if (!req.session.cartId) {
        //no cart so creating a new cart and store cart id on req.sesion.cartId
        cart = await cartsRepo.create({ items: [] });
        req.session.cartId = cart.id;
    } else { //there is a cart, so getting it from repository 
        cart = await cartsRepo.getOne(req.session.cartId);
    }
    console.log(cart);

    //Either increment quantity already in cart or add new product
    const existingItem = cart.items.find(item => item.id === req.body.productId);
    if (existingItem) {
        //incremening quanity and save cart
        existingItem.quantity++;
    } else { // add new product to array
        cart.items.push({ id: req.body.productId, quantity: 1 });
    }
    await cartsRepo.update(cart.id, {
        items: cart.items
    });

    res.redirect('/cart');
});

// reeicve get req to show all items in cart
router.get('/cart', async(req, res) => {
    if (!req.session.cartId) {
        return res.redirect('/');
    }

    const cart = await cartsRepo.getOne(req.session.cartId);

    for (let item of cart.items) {
        const product = await productsRespo.getOne(item.id);

        item.product = product;
    }

    res.send(cartShowTemplate({ items: cart.items }));
});

// recieve a post req to delete items in cart
router.post('/cart/products/delete', async(req, res) => {
    const { itemId } = req.body;
    const cart = await cartsRepo.getOne(req.session.cartId);

    const items = cart.items.filter(item => item.id !== itemId);

    await cartsRepo.update(req.session.cartId, { items });

    res.redirect('/cart');
});

module.exports = router;