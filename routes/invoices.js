const express = require("express");
const db = require('../db');
const ExpressError = require('../expressError');


let router = new express.Router()

router
    .route('/')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT id, comp_code
                FROM invoices`
            );
            return res.json({invoices: results.rows});
        } catch (err) {
            return next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const {comp_code, amt} = req.body;
            const result = await db.query(
                `INSERT INTO invoices (comp_code, amt)
                VALUES ($1, $2)
                RETURNING comp_code, amt`,
                [comp_code, amt]
            );
            return res.status(201).json({created_invoice: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    });

router
    .route('/:id')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT i.id, 
                        i.amt, 
                        i.paid, 
                        i.add_date, 
                        i.paid_date,
                        c.name,
                        c.description
                FROM invoices AS i
                INNER JOIN companies AS c ON (i.comp_code = c.code)
                WHERE id=$1`, [req.params.id]
            );
            if (results.rows.length === 0)
                throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
            const data = results.rows[0]
            const invoice = {
                id: data.id,
                amt: data.amt,
                paid: data.paid,
                add_date: data.add_date,
                paid_date: data.paid_date,
                company: {
                    code: data.comp_code,
                    name: data.name,
                    description: data.description
                }
            }
            return res.status(200).json({invoice: invoice})
        } catch (err) {
            return next(err);
        }
    })
    .put(async (req, res, next) => {
        try {
            const {amt} = req.body;
            const result = await db.query(
                `UPDATE invoices SET amt=$2
                WHERE id=$1
                RETURNING id, comp_code, amt, paid, add_date, paid_date`,
                [req.params.id, amt]
            );
            if (result.rows.length === 0)
                throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
            return res.json({updated_invoice: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const result = await db.query(
                `DELETE FROM invoices WHERE id=$1
                RETURNING id`,
                [req.params.id]
            );
            if (result.rows.length === 0)
                throw new ExpressError(`No such invoice: ${req.params.id}`, 404)
            return res.json({message: 'Deleted'});
        } catch (err) {
            return next(err);
        }
    });
    
module.exports = router;