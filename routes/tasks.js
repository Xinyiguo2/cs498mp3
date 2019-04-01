let User = require('../models/user')
let Task = require('../models/task')

module.exports = function (router) {

    var taskRoute = router.route('/tasks');

    taskRoute.get(function(req,res){

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

        Task.find(where).sort(sort).select(select).skip(skip).limit(limit).exec(function(err, tasks){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data: err.message
                });
            }else{
                if(!tasks.length){
                    res.json({
                        message: "404 not Found",
                        data: tasks
                    })
                }else{
                    if(count){
                        res.json({
                            message: "200 OK",
                            data: {
                                count : tasks.length
                            }
                        })
                    }else{
                        res.json({
                            message: "200 OK",
                            data: tasks
                        });
                    }
                }
            }
        }); 
    })

    taskRoute.post(function(req, res){
        var newTask = new Task();
        newTask.name = req.body.name;
        newTask.description = (req.body.description === undefined)? "": req.body.description;
        newTask.deadline = req.body.deadline;
        newTask.completed = (req.body.completed === undefined) ? false : req.body.completed;
        newTask.assignedUser = (req.body.assignedUser === undefined)? "":req.body.assignedUser;
        newTask.assignedUserName = (req.body.assignedUserName === undefined)? "unassigned":req.assignedUserName;
        newTask.dateCreated = Date.now();
        newTask.save(function(err){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data :{
                        "name" : req.body.name || "",
                        "email": req.body.deadline || "",
                        "error": err.message
                    }
                })
            }else{
                res.json({
                    message: '201 Created!',
                    data: {
                        "_id":newTask._id,
                        "name":newTask.name,
                        "deadline":newTask.deadline,
                        "description":newTask.description,
                        "dateCreated": newTask.dateCreated,
                        "assignedUser":newTask.assignedUser,
                        "assignedUserName":newTask.assignedUserName,
                        "completed": newTask.completed
                    }
                })
            }
        });
    })

    var specificTaskRoute = router.route('/tasks/:task_id')

    specificTaskRoute.get(function(req,res){
        Task.findOne({"_id":req.params.task_id}, function(err,task){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data:{
                        id: req.params.task_id,
                        error: err.message
                    }
                })
            }else{
                if(task === null){
                    res.json({
                        message: "404 not found!",
                        data: task
                    })
                }else{
                    res.json({
                        message: "200 OK",
                        data: task
                    })
                }
            }
        });
    })

    specificTaskRoute.put(function(req,res){
        Task.findOne({"_id":req.params.task_id},function(err, task){
            if(err){
                res.json({
                    message: "404 Bad Request",
                    data:{
                        _id: req.params.task_id,
                        error: "Invalid id"
                    }
                });
            }else{
                task.name = req.body.name;
                task.description = (req.body.description === undefined)? "":req.body.description;
                task.deadline = req.body.deadline;
                task.completed = (req.body.completed === undefined)? false:req.body.completed;
                task.assignedUser = (req.body.assignedUser === undefined)? "":req.body.assignedUser;
                task.assignedUserName = (req.body.assignedUserName === undefined)? "unassigned":req.body.assignedUserName;
                task.dateCreated = Date.now();
                task.save(function(err){
                    if(err){
                        res.json({
                            message: "400 Bad Request",
                            data:{
                                "name":req.body.name || "",
                                "email":req.body.deadline || "",
                                error: err.message
                            }
                        })
                    }else{
                        res.json({
                            message : '201 Created!',
                            data: task,
                        })
                    }
                });
            }
        });
    })

    specificTaskRoute.delete(function(req,res){
        Task.findOneAndDelete({_id:req.params.task_id}, function(err, task){
            if(err){
                res.json({
                    message: "404 not found",
                    data: {
                        _id : req.params.task_id,
                        error: "invalid id"
                    }
                })
            }else{
                if(task === null){
                    res.json({
                        message:"404 not found!",
                        data:{
                            _id : req.params.task_id,
                            error : "user does not exist or removed already."
                        }
                    })
                }else{
                    res.json({
                        message: "200 OK",
                        data:task
                    })
                }
            }
        });
    })

    return router;
}
