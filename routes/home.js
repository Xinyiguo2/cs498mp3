var secrets = require('../config/secrets');

module.exports = function (router) {

    var homeRoute = router.route('/');

    homeRoute.get(function (req, res) {
        var connectionString = secrets.token;
        if(connectionString === undefined){
            res.json({
                message: "500 server error"
            })
        }else{
            res.json({ message: 'My connection string is ' + connectionString });
        }
    });

    return router;
}
