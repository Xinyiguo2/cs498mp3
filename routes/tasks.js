let Task = require('../models/task')
let User = require('../models/user')

module.exports = function (router) {

    var taskRoute = router.route('/');

    taskRoute.get(function (req, res) {
        res.json({
            message: "aha"
        })
    });

    return router;
}
