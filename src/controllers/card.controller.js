'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Cards = require('../models/Card');

class Card {
    create = async (req, res) => {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "No se pudo cargar el gif" });

            let card = new Cards(fields);

            if (files.gif) {
                if (files.gif.size > 9000000) return res.status(400).json({ error: 'El gif debe de tener un tamaño inferior a 9 MB' });

                card.gif.data = fs.readFileSync(files.gif.path);
                card.gif.contetType = files.gif.contetType;
            }

            await card.save((err, result) => {
                if (err) return res.status(400).json({ error: 'No se ha creado' });
                result.gif = undefined;
                res.status(200).json(result);
            });
        });
    }

    getAll = async (req, res) => {
        let order = req.query.order ? req.query.order : 'asc';
        let sortBy = req.query.sortBy ? req.query.sortBy : 'name';

        await Cards.find()
            .select(['-gif'])
            .populate('lesson', '-icon')
            .sort([[sortBy, order]])
            .exec((err, card) => {
                if (err) return res.status(400).json({ error: 'Tarjetas de Conocimiento no encontradas' });
                res.status(200).json(card);
            });
    }

    getById = (req, res) => {
        req.card.gif = undefined;
        res.status(200).json(req.card);
    }

    remove = async (req, res) => {
        let card = req.card;
        await card.remove((err, deleteCard) => {
            if (err) return res.status(400).json({ error: 'La tarjeta de conocimiento no se eliminó' });
            res.status(200).json({ message: 'La tarjeta de conocimiento se eliminó con éxito' });
        });
    }

    update = async (req, res) => {
        const { question, lesson, correctAnswer, wrongAnswer } = req.body;
        let card = req.card;

        if (question) card.question = question;
        if (lesson) card.lesson = lesson;
        if (correctAnswer) card.correctAnswer = correctAnswer;
        if (wrongAnswer) card.wrongAnswer = wrongAnswer;

        await card.save((err, data) => {
            if (err) return res.status(400).json({ error: 'La tarjeta de conocimiento no se ha actualizado' });
            res.status(200).json({ message: 'La tarjeta de conocmiento se actualizado correctamente' });
        });
    }

    byId = async (req, res, next, id) => {
        await Cards.findById(id)
            .populate('lesson', '-icon')
            .exec((err, card) => {
                if (err || !card) return res.status(400).json({ error: 'El microcontenido no se encontró o no existe' });
                req.card = card;
                next();
            });
    }
}

module.exports = Card;