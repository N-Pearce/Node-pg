const express = require("express");
const db = require('../db')

let router = new express.Router()


router
    .route('/')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT code, name, description
                FROM companies`
            );
            return res.json({companies: results.rows});
        } catch (err) {
            return next(err);
        }
    })
    .post(async (req, res, next) => {
        try {
            const {code, name, description} = req.body;
            const result = await db.query(
                `INSERT INTO companies (code, name, description)
                VALUES ($1, $2, $3)
                RETURNING code, name, description`,
                [code, name, description]
            );
            return res.statusCode(201).json({created_company: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    });

router
    .route('/:code')
    .get(async (req, res, next) => {
        try {
            const results = await db.query(
                `SELECT code, name, description
                FROM companies
                WHERE code=$1`, [req.params.code]
            );
            const invoiceResults = await db.query(
                `SELECT id FROM invoices
                WHERE comp_code = $1`, [req.params.code]
            )
            const company = results.rows[0]
            const invoices = invoiceResults.rows
            company.invoices = invoices.map(inv => inv.id)

            return res.json({comapany: company})
        } catch (err) {
            return next(err);
        }
    })
    .put(async (req, res, next) => {
        try {
            const {code, name, description} = req.body;
            const result = await db.query(
                `UPDATE companies SET name=$2, description=$3
                WHERE code=$1
                RETURNING code, name, description`,
                [code, name, description]
            );
            return res.json({updated_company: result.rows[0]});
        } catch (err) {
            return next(err);
        }
    })
    .delete(async (req, res, next) => {
        try {
            const {code} = req.body;
            const result = await db.query(
                `DELETE FROM companies WHERE code=$1`,
                [code]
            );
            return res.json({message: 'Deleted'});
        } catch (err) {
            return next(err);
        }
    });

module.exports = router;