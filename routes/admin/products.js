const express = require('express');

const multer = require('multer');

const { handleErrors, requireAuth } = require('./middleware');
const productsRepo = require('../../Repositories/products');
const productsNewTemplate = require('../../views/admin/products/new');
const proudctsIndexTemplate = require('../../views/admin/products/index');
const productsEditTemplate = require('../../views/admin/products/edit');
const { requireTitle, requirePrice } = require('./validators.js');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() })

router.get('/admin/products', requireAuth, async(req, res) => {
    const products = await productsRepo.getAll();
    res.send(proudctsIndexTemplate({ products }));
});

router.get('/admin/products/new', requireAuth, (req, res) => {
    res.send(productsNewTemplate({}));
});

router.post('/admin/products/new', requireAuth,
    upload.single('image'), [requireTitle, requirePrice],
    handleErrors(productsNewTemplate),

    async(req, res) => {
        const image = (req.file.buffer.toString('base64'));
        const { title, price } = req.body;

        // handling saving the products here
        await productsRepo.create({ title, price, image })

        res.redirect('/admin/products');
    });
router.get('/admin/products/:id/edit', requireAuth, async(req, res) => { // id -->wildcard
    const product = await productsRepo.getOne(req.params.id);

    if (!product) {
        return res.send('product not found');
    }

    res.send(productsEditTemplate({ product }));
});

router.post('/admin/products/:id/edit',
    requireAuth,
    upload.single('image'), [requireTitle, requirePrice],
    handleErrors(productsEditTemplate, async(req) => {
        const product = await productsRepo.getOne(req.params.id);
        return { product };
    }),
    async(req, res) => {

        const changes = req.body;

        //checking t see if image is included in the request
        if (req.file) {
            changes.image = req.file.buffer.toString('base64');
        }

        try {
            await productsRepo.update(req.params.id, changes);
        } catch (err) {
            return res.send('item not found');
        }

        res.redirect('/admin/products');
    });

router.post('/admin/products/:id/delete', requireAuth, async(req, res) => {
    await productsRepo.delete(req.params.id);

    res.redirect('/admin/products');
});

module.exports = router;