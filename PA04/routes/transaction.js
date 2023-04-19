express = require('express');
const router = express.Router();
const transaction = require('../models/transaction')

isLoggedIn = (_, res, next) => {
    if (res.locals.loggedIn) {
        next()
    } else {
        res.redirect('/login')
    }
}

router.get('/transaction/', isLoggedIn, async (req, res) => {
    let transactions
    res.locals.group = false
    if (req.query.groupBy == 'category') {
        transactions = await transaction.aggregate([
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' }
                }
            }
        ])
        res.locals.group = true
        console.log(transactions)
    }
    else if (req.query.sortBy == 'category') {
        transactions = await transaction.find({ userId: req.user._id }).sort({ category: 1 })
    }
    else if (req.query.sortBy == 'amount') {
        transactions = await transaction.find({ userId: req.user._id }).sort({ amount: 1 })
    }
    else if (req.query.sortBy == 'description') {
        transactions = await transaction.find({ userId: req.user._id }).sort({ description: 1 })
    }
    else if (req.query.sortBy == 'date') {
        transactions = await transaction.find({ userId: req.user._id }).sort({ date: 1 })
    }
    else {
        transactions = await transaction.find({ userId: req.user._id })
    }
    res.render('transaction', { transactions })
})


router.post('/transaction', isLoggedIn, async (req, res) => {
    const newTransaction = new transaction({
        description: req.body.description,
        amount: req.body.amount,
        category: req.body.category,
        date: req.body.date,
        userId: req.user._id
    })
    await newTransaction.save()
    res.redirect('/transaction')
})


router.get('/transaction/remove/:transactionId', isLoggedIn, async (req, res) => {
    await transaction.deleteOne({ _id: req.params.transactionId });
    res.redirect('/transaction')
})


router.get('/transaction/edit/:transactionId', isLoggedIn, async (req, res) => {
    const item = await transaction.findById(req.params.transactionId)
    res.render('editTrans', { item })
})


router.post('/transaction/put', isLoggedIn, async (req, res) => {
    const { description, amount, category, date, itemId } = req.body
    await transaction.findOneAndUpdate(
        { _id: itemId },
        { $set: { description, amount, category, date } });
    res.redirect('/transaction')
})


module.exports = router