let Task = require('../models/task')
let User = require('../models/user')

module.exports = function (router) {

    var taskRoute = router.route('/tasks');

    taskRoute.get(function (req, res) {
        var where = req.query.where;
        var sort = req.query.sort;
        var select = req.query.select;
        var skip = req.query.skip;
        var limit = req.query.limit;
        var count = req.query.count;

        if(where != undefined){
            where = JSON.parse(where);
            console.log(where)
        }
        if(sort != undefined){
            sort = JSON.parse(sort);
            console.log(sort)
        }
        if(select != undefined){
            select = JSON.parse(select);
            console.log(select)
        }
        if(skip === undefined){
            skip = 0;
            console.log(skip)
        }
        skip = parseInt(skip)
        if(limit === undefined){
            limit = 100;
            console.log(limit)
        }
        limit = parseInt(limit)
        if(count === undefined){
            count = false
        }
        count = (count === 'true')

        Task.find(where).sort(sort).select(select).skip(skip).limit(limit).exec(function(err, tasks){
            if(err){
                res.send(err)
            }else{
                if(!tasks.length){
                    res.json({
                        message: "404 not found",
                        data: {
                            error: "no data found"
                        }
                    })
                }else{
                    if(count){
                        res.json({
                            message: "200 OK ",
                            data:{
                                count : tasks.length
                            }
                        })
                    }else{
                        res.json({
                            message: "200 OK",
                            data:{tasks}
                        })
                    }
                }
            }
        })
    });

    taskRoute.post(function(req,res){
        var newTask = new Task();
        newTask.name = req.body.name;
        newTask.deadline = req.body.deadline;
        newTask.completed = (req.body.completed === undefined)? false : req.body.completed;
        newTask.description = (req.body.description === undefined)? "" : req.body.description;
        // console.log(req.body.assignedUser)
        // console.log(req.body.assignedUserName)
        newTask.dateCreated = Date.now();

        if(req.body.assignedUserName !== undefined){
            User.findOne({name:req.body.assignedUserName},function(err, user){
                if(err){
                }else{
                    if(user === null){
                    }else{
                        if(req.body.assignedUser !== undefined && req.body.assignedUser !== user._id){
                            newTask.assignedUserName = req.body.assignedUserName;
                            newTask.assignedUser = user._id;
                        }
                    }
                }
                newTask.save(function(err){
                    if(err){
                        res.json({
                            message: "error"
                        })
                    }
                });
                if(newTask.assignedUser !== ""){
                    User.update({_id:newTask.assignedUser},{
                        $push: {
                            pendingTasks: newTask._id
                        }
                    })
                }
                res.json({
                    message : "201 Created!",
                    data:{
                        "_id":newTask._id,
                        "name": newTask.name,
                        "description":newTask.description,
                        "deadline":newTask.deadline,
                        "completed":newTask.completed,
                        "assignedUser":newTask.assignedUser,
                        "assignUserName":newTask.assignedUserName,
                        "dateCreated":newTask.dateCreated
                    }
                })
            })
        }else{
            if(req.body.assignedUser !== undefined){
                User.findById(req.body.assignedUser, function(err,user){
                    if(err){
                    }else{
                        if(user === null){
                        }else{
                            newTask.assignedUser = req.body.assignedUser;
                            newTask.assignedUserName = user.name;
                        }
                    }
                    newTask.save(function(err){
                        if(err){
                            res.send(err)
                        }
                    });
                    if(newTask.assignedUser != ""){
                        User.update({_id:newTask.assignedUser},{
                            $push:{pendingTasks:newTask}
                        })
                    }
                    res.json({
                        message:"201 Created!",
                        data:{
                            "_id":newTask._id,
                            "name": newTask.name,
                            "description":newTask.description,
                            "deadline":newTask.deadline,
                            "completed":newTask.completed,
                            "assignedUser":newTask.assignedUser,
                            "assignUserName":newTask.assignedUserName,
                            "dateCreated":newTask.dateCreated
                        }
                    })
                })
            }else{
                newTask.save(function(err){
                    if(err){
                        res.send(err)
                    }else{
                        res.json({
                            message:"201 Created!",
                            data:{
                                "_id":newTask._id,
                                "name": newTask.name,
                                "description":newTask.description,
                                "deadline":newTask.deadline,
                                "completed":newTask.completed,
                                "assignedUser":newTask.assignedUser,
                                "assignUserName":newTask.assignedUserName,
                                "dateCreated":newTask.dateCreated
                            }
                        })
                    }
                })
            }
        }
    })

    var specificTaskRoute = router.route('/tasks/:task_id')
    
    return router;
}
