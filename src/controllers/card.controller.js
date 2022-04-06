'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs-extra');
const { uploadImage, deleteImage } = require('../libs/cloudinary');


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
        try {
            // get request body information
            const { question, lesson, correctAnswer, wrongAnswer } = req.body;
            // check if an gif was sent and save it in cloudinary
            let gif;
            if (req.files.gif) {
                const resultGif = await uploadImage(req.files.gif.tempFilePath);
                gif = {
                    url: resultGif.secure_url,
                    public_id: resultGif.public_id
                }
                await fs.remove(req.files.gif.tempFilePath)
            }
            // a knowledge cards is created with the form data
            let card = new Cards({ question, lesson, correctAnswer, wrongAnswer, gif_url: gif });
            // save to database
            await card.save();
            // return the knowledge card
            return res.status(200).json(card);
        } catch (error) {
            return res.status(400).json({ error: 'No se ha creado' });
        }
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
        try {
            // get the Card object provided by the request
            let card = req.card;
            // check if you have the gif url registered and delete it
            if (card.gif_url.public_id) {
                await deleteImage(card.gif_url.public_id);
            }
            // remove the knowledge cards
            const cardRemoved = card.remove();
            // check if it was deleted
            if (!cardRemoved) return res.status(400).json({ error: 'La tarjeta de conocimiento no se eliminó' });
            // return a response
            return res.status(200).json({ message: 'La tarjeta de conocimiento se eliminó con éxito' });
        } catch (error) {
            return res.status(400).json({ error: 'La tarjeta de conocimiento no se eliminó' });
        }
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
     * @param {string} id Card ID obtained from the URL parameter
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