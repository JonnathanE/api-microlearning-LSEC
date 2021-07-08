
exports.lessonIcon = (req, res, next) => {
    if (req.lesson.icon.data) {
        res.set('Content-Type', req.lesson.icon.contentType);
        return res.send(req.lesson.icon.data);
    }
    next();
}