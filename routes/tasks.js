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
        newTask.dateCreated = Date.now();

        if(req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned" && req.body.assignedUser !== undefined && req.body.assignedUser != "") {
            newTask.assignedUserName = req.body.assignedUserName;
            newTask.assignedUser = req.body.assignedUser
            //console.log(newTask.assignedUserName)
        }else if(req.body.assignedUser !== undefined && req.body.assignedUser != ""){
            newTask.assignedUser = req.body.assignedUser;
            User.findOne({"_id":newTask.assignedUser},function(err, user){
                if(err || user ===null){
                    newTask.assignedUser = "";
                    newTask.assignedUserName = "unassigned";
                }else{
                    newTask.assignedUserName = user.name;
                    //console.log(newTask.assignedUserName)
                }
            })
        }else if(req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
            //console.log(newTask.assignedUserName)
            newTask.assignedUserName = req.body.assignedUserName;
            User.findOne({"name":newTask.assignedUserName},function(err, user){
                if(err || user === null){
                    newTask.assignedUserName = "unassigned";
                    newTask.assignedUser = "";
                }else{
                    newTask.assignedUser = user._id;
                }
            })
        }

        newTask.save(function(err){
            if(err){
                console.log("/???????????????????????????????????????")
                console.log(newTask._id)
                console.log("?????????????????????????????????????????")
            }else{
                if(newTask.assignedUser !== ""){
                    User.findOneAndUpdate({"_id":newTask.assignedUser},
                        {$addToSet:{pendingTasks:[newTask._id]}},
                        function(err,user){
                            if(err){
                                console.log(err.message)
                            }else{
                                console.log("==================")
                            }
                    })
                }

            }
        })
        res.json({
            message: "201 Created!",
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
        // User.findByIdAndUpdate()

        // if(req.body.assignedUserName !== undefined){
        //     User.findOne({name:req.body.assignedUserName},function(err, user){
        //         if(err){
        //         }else{
        //             if(user === null){
        //             }else{
        //                 if(req.body.assignedUser !== undefined && req.body.assignedUser !== user._id){
        //                     newTask.assignedUserName = req.body.assignedUserName;
        //                     newTask.assignedUser = user._id;
        //                 }else{
        //                     newTask.assignedUserName = user.name;
        //                     newTask.assignedUser = user._id;
        //                 }
        //             }
        //         }
        //         newTask.save(function(err){
        //             if(err){
        //                 //console.log("err");
        //             }else{
        //                 if(newTask.assignedUser !== ""){
        //                     //console.log(newTask.assignedUserName);
        //                     //console.log(newTask.assignedUser)
        //                     User.findByIdAndUpdate(newTask.assignedUser,{
        //                         $push: {
        //                             pendingTasks: newTask._id
        //                         }
        //                     },function(err){
        //                         console.log(newTask.assignedUserName)
        //                         //console.log(err);
        //                     })
        //                 }
        //             }
        //         });

        //         res.json({
        //             message : "201 Created!",
        //             data:{
        //                 "_id":newTask._id,
        //                 "name": newTask.name,
        //                 "description":newTask.description,
        //                 "deadline":newTask.deadline,
        //                 "completed":newTask.completed,
        //                 "assignedUser":newTask.assignedUser,
        //                 "assignUserName":newTask.assignedUserName,
        //                 "dateCreated":newTask.dateCreated
        //             }
        //         })
        //     })
        // }else{
        //     if(req.body.assignedUser !== undefined){
        //         User.findById(req.body.assignedUser, function(err,user){
        //             if(err){
        //             }else{
        //                 if(user === null){
        //                 }else{
        //                     newTask.assignedUser = req.body.assignedUser;
        //                     newTask.assignedUserName = user.name;
        //                 }
        //             }
        //             newTask.save(function(err){
        //                 if(err){
        //                     //console.log(err)
        //                 }else{
        //                     if(newTask.assignedUser !== ""){
        //                         //console.log(newTask.assignedUserName);
        //                         //console.log(newTask.assignedUser)
        //                         User.findByIdAndUpdate(newTask.assignedUser,{
        //                             $push:{pendingTasks:newTask._id}
        //                         },function(err){
        //                             console.log(newTask.assignUserName)
        //                             //console.log(err);
        //                         })
        //                     }
        //                 }
        //             });

        //             res.json({
        //                 message:"201 Created!",
        //                 data:{
        //                     "_id":newTask._id,
        //                     "name": newTask.name,
        //                     "description":newTask.description,
        //                     "deadline":newTask.deadline,
        //                     "completed":newTask.completed,
        //                     "assignedUser":newTask.assignedUser,
        //                     "assignUserName":newTask.assignedUserName,
        //                     "dateCreated":newTask.dateCreated
        //                 }
        //             })
        //         })
        //     }else{
        //         newTask.save(function(err){
        //             if(err){
        //                 res.send(err)
        //             }else{
        //                 res.json({
        //                     message:"201 Created!",
        //                     data:{
        //                         "_id":newTask._id,
        //                         "name": newTask.name,
        //                         "description":newTask.description,
        //                         "deadline":newTask.deadline,
        //                         "completed":newTask.completed,
        //                         "assignedUser":newTask.assignedUser,
        //                         "assignUserName":newTask.assignedUserName,
        //                         "dateCreated":newTask.dateCreated
        //                     }
        //                 })
        //             }
        //         })
        //     }
        // }
    })

    var specificTaskRoute = router.route('/tasks/:task_id');

    specificTaskRoute.get(function(req,res){
        Task.findOne({_id:req.params.task_id},function(err,task){
            if(err){
                res.json({
                    message:"400 Bad Request",
                    data:{
                        id: req.params.task_id,
                        error:err.message
                    }
                })
            }else{
                if(task === null){
                    res.json({
                        message:"404 not found",
                        data:{task}
                    })
                }else{
                    res.json({
                        message:"200 OK",
                        data:{task}
                    })
                }
            }
        });
    })

    specificTaskRoute.put(function(req,res){
        Task.findOne({_id:req.params.task_id},function(err,task){
            if(err){
                res.json({
                    message: "400 Bad Request",
                    data:{
                        id: req.params.task_id,
                        error:err.message
                    }
                })
            }else{
                if(task === null){
                    res.json({
                        message:"non exist"
                    })
                }else{
                    var oldUser = task.assignedUser;
                    task.name = req.body.name;
                    task.description = req.body.description;
                    task.deadline = req.body.deadline;
                    task.completed = (req.body.completed === undefined)? false : req.body.completed;
                    task.dateCreated = Date.now();
                    if(req.body.assignedUser !== undefined && req.body.assignedUser !== "" && req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
                        task.assignedUser = req.body.assignedUser;
                        task.assignedUserName = req.body.assignedUserName;
                    }else if(req.body.assignedUser !== undefined && req.body.assignedUser !== ""){
                        User.findOne({_id:req.body.assignedUser},function(err,user){
                            if(err){
                                task.assignedUserName = "unassigned";
                                task.assignedUser = "";
                            }else{
                                task.assignedUser = req.body.assignedUser;
                                task.assignedUserName = user.name;
                            }
                        });
                    }else if(req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
                        User.findOne({name:req.body.assignedUserName},function(err,user){
                            if(err){
                                task.assignedUserName = "unassigned";
                                task.assignedUser = "";
                            }else{
                                task.assignedUserName = req.body.assignedUserName;
                                task.assignedUser = user._id;
                            }
                        })
                    }else{
                        task.assignedUserName = "unassigned";
                        task.assignedUser = "";
                    }
                    task.save(function(err){
                        if(err){
                            res.json({
                                message:"error",
                                error: err.message
                        
                            })
                        }else{
                            res.json({
                                message:"201 Created!",
                                data:{
                                    task
                                }
                            })
                        }
                    })
                    if(oldUser !== task.assignedUser && oldUser !== ""){
                        User.findOneAndUpdate({_id:oldUser},
                            {$pull:{pendingTasks: {$in:[task._id]}}},
                            function(err){
                                console.log(err)
                            })
                    }
                }
            }
        })
    })

    specificTaskRoute.delete(function(req,res){
        Task.findOneAndDelete({_id:req.params.task_id},function(err,task){
            if(err){
                res.json({
                    message:"wrong"
                })
            }else{
                if(task === null){
                    res.json({
                        message: "404 not found"
                    })
                }else{
                    if(task.assignedUser !== ""){
                        User.findOneAndUpdate({_id:task.assignedUser},
                            {$pull:{pendingTasks:{$in:[task._id]}}},
                            function(err,user){
                                if(err){
                                    console.log(err.message)
                                }else{
                                    console.log(user)
                                }
                            })
                    }
                    res.json({
                        message: "deleted",
                        data:{task}
                    })
                }
            }
        })

    })
    
    return router;
}
