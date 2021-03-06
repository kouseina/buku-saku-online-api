const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// import helper
const config = require('../../config.json');
const db = require('../../helpers/db');
const { ERROR: httpError } = require('../../helpers/httpError');
const response = require('../../helpers/wrapper');

const User = db.User;

// routes
router.post('/admin/login', authenticateAdmin);
router.post('/admin/register', createAdmin);
router.get('/admin/all', getAllAdmin);
router.post('/register', registerUser);
router.post('/login', authenticateAdmin);
router.get('/all', getAllUser);
router.delete('/delete', deleteAllUser);

module.exports = router;

async function createAdmin(req,res) {
    try {
        let model = {
            name : req.body.name,
            email : req.body.email,
            password : bcrypt.hashSync(req.body.password, 10),
            role: "admin"
        }
        let checkEmail = await User.findOne({ "email" : model.email });
    
        if (checkEmail) {
            return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Email is already taken')
        }
    
        const user = new User(model)
        let query = await user.save();
    
        return response.wrapper_success(res, 200, 'Succes Register Admin', query )
    } catch (error) {
        console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')        
    }
    
}

async function authenticateAdmin(req, res) {
    try {
        let model = {
            email : req.body.email,
            password : req.body.password
        }
        const checkEmail = await User.findOne({ "email" : model.email });

        if(!checkEmail) {
            return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Email Incorrect')
        }
    
        if(checkEmail && bcrypt.compareSync(model.password, checkEmail.password)) {
            const token = jwt.sign({ sub: checkEmail.id }, config.secret);
            return response.wrapper_success(res, 200, 'Succes Login', checkEmail,token )
        } else {
            return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Password Incorrect')
        }
    } catch (error) {
        console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')                
    }

}

async function registerUser(req,res) {
    try {
        let model = {
            name: req.body.name,
            email: req.body.email,
            class: req.body.class,
            nis: req.body.nis,
            point: 0,
            password : bcrypt.hashSync(req.body.password, 10),
            role: "user"
        }
        let checkEmail = await User.findOne({ "email" : model.email });
    
        if (checkEmail) {
            return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Email is already taken')
        }
    
        const user = new User(model)
        let query = await user.save();
    
        return response.wrapper_success(res, 200, 'Succes Register User', query )
    } catch (error) {
        console.log(error)
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')        
    }
    
}

async function getAllUser(req,res) {
    try {
        let query = await User.find({ "role": "user" });
        return response.wrapper_success(res, 200, "Sukses Get All User", query)
    } catch (error) {
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')         
    }
    
}

async function getAllAdmin(req,res) {
    try {
        let query = await User.find({ "role": "admin" });
        return response.wrapper_success(res, 200, "Sukses Get All User", query)
    } catch (error) {
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')         
    }
    
}

async function deleteAllUser(req,res) {
    try {
        let query = await User.remove();
        return response.wrapper_success(res, 200, "Sukses Hapus All User", query)
    } catch (error) {
        return response.wrapper_error(res, httpError.INTERNAL_ERROR, 'Something is wrong')                         
    }
}