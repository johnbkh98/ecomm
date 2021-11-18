const express = require('express');
const { handleErrors } = require('./middleware');

const usersRepo = require('../../Repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');
const {
    requireEmail,
    requirePassword,
    requirePasswordConfirmation,
    requireEmailExists,
    requireValidPasswordForUser
} = require('./validators');
const signin = require('../../views/admin/auth/signin');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});



// route handler
router.post('/signup', [
        requireEmail,
        requirePassword,
        requirePasswordConfirmation,
    ],
    handleErrors(signupTemplate),
    async(req, res) => {
        // checking if user is already signed up with email before
        const { email, password } = req.body;
        // create a user in our user repo to represent this person
        const user = await usersRepo.create({ email, password });

        // store the id of that user inside the users cookie
        req.session.userID = user.id;

        res.redirect(`/admin/products`)
    });


//telling browser to forget about all information stored in cookie when user signs out
router.get('/signout', (req, res) => {
    req.session = null; // clearing out any cookie data


    res.redirect('/signin');
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({}));
});


//  ****handling signin functionality****
router.post('/signin', [requireEmailExists, requireValidPasswordForUser],
    handleErrors(signinTemplate),
    async(req, res) => {
        const { email } = req.body;
        const user = await usersRepo.getOneBy({ email });
        req.session.userID = user.id;
        res.redirect('/admin/products');
    });

module.exports = router;