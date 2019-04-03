let User = require('../models/user')
let Task = require('../models/task')

module.exports = function (router) {

    var userRoute = router.route('/users');

    userRoute.get(function(req,res){

        var where = req.query.where;
        var sort = req.query.sort;
        var select = req.query.select;
        var skip = req.query.skip;
        var limit = req.query.limit;
        var count = req.query.count;

        if(where != undefined){
            where = JSON.parse(where);
            //console.log(where)
        }
        if(sort != undefined){
            sort = JSON.parse(sort);
            //console.log(sort) 
        }
        if(select != undefined){
            select = JSON.parse(select);
            //console.log(select)
        }
        if(skip === undefined){
            skip = 0;
           //console.log(skip)
        }
        skip = parseInt(skip)
        if(limit === undefined){
            limit = 100;
            //console.log(limit)
        }
        limit = parseInt(limit)
        if(count === undefined){
            count = false
        }
        count = (count === 'true')

        User.find(where).sort(sort).select(select).skip(skip).limit(limit).exec(function(err, users){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data: err.message
                });
            }else{
                if(!users.length){
                    res.json({
                        message: "404 not Found",
                        data: users
                    })
                }else{
                    if(count){
                        res.json({
                            message: "200 Success",
                            data: {
                                count : users.length
                            }
                        })
                    }else{
                        res.json({
                            message: "200 Success",
                            data: users
                        });
                    }
                }
            }
        }); 
    })

    userRoute.post(function(req, res){
        var newUser = new User();
        newUser.name = req.body.name;
        newUser.email = req.body.email;
        newUser.pendingTasks = (req.body.pendingTasks === undefined)? []:req.body.pendingTasks;
        newUser.dateCreated = Date.now();
        newUser.save(function(err,user){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data :{
                        "name" : req.body.name || "",
                        "email": req.body.email || "",
                        "error": err.message
                    }
                })
            }else{
                var currentTasks = user.pendingTasks;
                currentTasks.forEach(function(taskId){
                    Task.updateOne({"_id":taskId},
                    {$set:{assignedUser:user._id,assignedUserName:user.name}},
                    function(err,t){
                        if(err){
                            console.log(err)
                        }
                    })
                })
                res.json({
                    message: '201 Created!',
                    data: {
                        "_id":newUser._id,
                        "name":newUser.name,
                        "email":newUser.email,
                        "pendingTasks":newUser.pendingTasks,
                        "dateCreated": newUser.dateCreated
                    }
                })
            }
        });
    })

    var specificUserRoute = router.route('/users/:user_id')

    specificUserRoute.get(function(req,res){
        User.findOne({"_id":req.params.user_id}, function(err,user){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data:{
                        id: req.params.user_id,
                        error: err.message
                    }
                })
            }else{
                if(user === null){
                    res.json({
                        message: "404 not found!",
                        data: user
                    })
                }else{
                    res.json({
                        message: "200 Success",
                        data: user
                    })
                }
            }
        });
    })

    specificUserRoute.put(function(req,res){
        User.findOne({"_id":req.params.user_id},function(err, user){
            if(err){
                res.json({
                    message: "404 Bad Request",
                    data:{
                        _id: req.params.user_id,
                        error: "Invalid id"
                    }
                });
            }else{
                var oldName = user.name
                var oldPendingTasks = user.pendingTasks
                user.name = req.body.name;
                user.email = req.body.email;
                user.dateCreated = Date.now();
                if(req.body.pendingTasks === undefined){
                    user.pendingTasks = (req.body.name === oldName)? oldPendingTasks: [] 
                }else{
                    user.pendingTasks = req.body.pendingTasks
                }
                //if updateing to a new user, clear the previous user's tasks 
                Task.updateMany({"assignedUser":user._id},{$set:{assignedUser:"",assignedUserName : "unassigned"}},function(err,doc){
                    if(err){
                        console.log(err)
                    }
                })
                //user.pendingTasks = (req.body.pendingTasks === undefined)? []:req.body.pendingTasks;
                user.save(function(err,user){
                    if(err){
                        res.json({
                            message: "400 Bad Request",
                            data:{
                                "name":req.body.name || "",
                                "email":req.body.email || "",
                                error: err.message
                            }
                        })
                    }else{
                        var currentTask = user.pendingTasks
                        currentTask.forEach(function(taskID){
                            Task.updateOne({"_id":taskID},
                            {$set:{assignedUser:user._id, assignedUserName:user.name}},
                            function(err,ta){
                                if(err){
                                    console.log(err)
                                }
                            })
                        })
                        res.json({
                            message : '201 Created!',
                            data: user,
                        })
                    }
                });
            }
        });
    })

    specificUserRoute.delete(function(req,res){
        User.findOneAndDelete({_id:req.params.user_id}, function(err, user){
            if(err){
                res.json({
                    message: "404 not found",
                    data: {
                        _id : req.params.user_id,
                        error: "invalid id"
                    }
                })
            }else{
                if(user === null){
                    res.json({
                        message:"404 not found!",
                        data:{
                            _id : req.params.user_id,
                            error : "user does not exist or removed already."
                        }
                    })
                }else{
                    Task.updateMany({assignedUser:user._id},{$set:{assignedUser:"",assignedUserName:"unassigned"}},function(err){
                        if(err){
                            console.log(err)
                        }
                    })
                    res.json({
                        message: "200 Success",
                        data:user
                    })
                }
            }
        });
    })

    return router;
}
