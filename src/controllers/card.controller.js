'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Cards = require('../models/Card');

/**
 * Class to manage knowledge cards
 */
class Card {

    /** 
     * Method to create a new knowledge card
     * @returns {JSON}
     */
    create = async (req, res) => {
        // created a new form object
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        // I extract the data from the request form
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "No se pudo cargar el gif" });
            // a knowledge cards is created with the form data
            let card = new Cards(fields);
            // it is verified if the sent file is of type gif
            if (files.gif) {
                // file size is checked
                if (files.gif.size > 9000000) return res.status(400).json({ error: 'El gif debe de tener un tamaño inferior a 9 MB' });
                // the gif is stored in the object card as a buffer data type
                card.gif.data = fs.readFileSync(files.gif.path);
                card.gif.contentType = files.gif.type;
            }
            // the knowledge cards is saved in the database
            await card.save((err, result) => {
                if (err) return res.status(400).json({ error: 'No se ha creado' });
                result.gif = undefined;
                // returns the knowledge cards data in JSON format
                res.status(200).json(result);
            });
        });
    }

    /**
     * Method to get all knowledge cards
     * @returns {JSON}
     */
    getAll = async (req, res) => {
        // the search filters are obtained from the request
        let order = req.query.order ? req.query.order : 'asc';
        let sortBy = req.query.sortBy ? req.query.sortBy : 'name';
        // all the knowledge cards from the database are obtained and returned in JSON format
        await Cards.find()
            .select(['-gif'])
            .populate('lesson', '-icon')
            .sort([[sortBy, order]])
            .exec((err, card) => {
                if (err) return res.status(400).json({ error: 'Tarjetas de Conocimiento no encontradas' });
                res.status(200).json(card);
            });
    }

    /**
     * Method to return the knowledge card by id.
     * The method only returns the information except the gif.
     * The search method is {@link byId} where it is stored in the request, therefore the method only returns the object that is already in the request.
     * @returns {JSON}
     */
    getById = (req, res) => {
        req.card.gif = undefined;
        res.status(200).json(req.card);
    }

    /**
     * Method to remove a knowledge card
     * @param {{card: Object}} req request with the knowledge cards object provided by the {@link byId} function
     * @returns {JSON}
     */
    remove = async (req, res) => {
        // get the Card object provided by the request
        let card = req.card;
        // remove the knowledge cards
        await card.remove((err, deleteCard) => {
            if (err) return res.status(400).json({ error: 'La tarjeta de conocimiento no se eliminó' });
            res.status(200).json({ message: 'La tarjeta de conocimiento se eliminó con éxito' });
        });
    }

    /**
     * Method to update a knowledge card
     * @param {{body: Object}} req Request where the form data is located
     * @returns {JSON}
     */
    update = async (req, res) => {
        // get the data from the request form
        const { question, lesson, correctAnswer, wrongAnswer } = req.body;
        // get the card object from the request
        let card = req.card;
        // replace the information in the card object
        if (question) card.question = question;
        if (lesson) card.lesson = lesson;
        if (correctAnswer) card.correctAnswer = correctAnswer;
        if (wrongAnswer) card.wrongAnswer = wrongAnswer;
        // update the new information in the database
        await card.save((err, data) => {
            if (err) return res.status(400).json({ error: 'La tarjeta de conocimiento no se ha actualizado' });
            res.status(200).json({ message: 'La tarjeta de conocmiento se actualizado correctamente' });
        });
    }

    /**
     * Method to obtain a knowledge card by id.
     * The method stores the object in the request.
     * @param {Object} req Request where the knowledge cards will be stored
     * @param {Object} res Http response parameter
     * @param {Object} next next
     * @param {string} id User ID obtained from the URL parameter
     */
    byId = async (req, res, next, id) => {
        // search for knowledge cards by id
        await Cards.findById(id)
            .populate('lesson', '-icon')
            .exec((err, card) => {
                if (err || !card) return res.status(400).json({ error: 'La tarjeta de conocimiento no se encontró o no existe' });
                // save the knowledge cards found in the request
                req.card = card;
                // continue with the next process
                next();
            });
    }
}

module.exports = Card;