'use strict';
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const Lessons = require('../models/Lesson');
const { errorHandler } = require('../helpers/dberrorHandler');

class Lesson {
    create = async (req, res) => {
        let form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(400).json({ error: "Image could not be uploaded" });

            const { name, module} = fields;
            let lesson = new Lessons(fields);

            if (files.icon) {
                if (files.icon.size > 1000000) {
                    return res.status(400).json({ error: "Image should be less than 1MB in size" });
                }
                lesson.icon.data = fs.readFileSync(files.icon.path);
                lesson.icon.contentType = files.icon.type;
            }

            await lesson.save((err, result) => {
                if (err) return res.starus(400).json({ error: errorHandler(err) });
                res.json(result);
            });
        });
    }

    getAll = () => { }

    getById = () => { }

    remove = () => { }

    update = () => { }

    byId = () => { }
}

module.exports = Lesson;