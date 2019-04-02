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
                            message: "200 Success",
                            data: {
                                count : tasks.length
                            }
                        })
                    }else{
                        res.json({
                            message: "200 Success",
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
        newTask.dateCreated = Date.now();
        if(req.body.assignedUser !== undefined && req.body.assignedUser !== "" && req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
            newTask.assignedUserName = req.body.assignedUserName;
            newTask.assignedUser = req.body.assignedUser;
            newTask.save(function(err,task){
                if(err){
                    console.log("failed with applied name  and id ")
                    res.json({
                        message: "400 Bad Request",
                        data :{
                            "name" : req.body.name || "",
                            "email": req.body.deadline || "",
                            "error": err.message
                        }
                    })
                }else{
                    User.findOneAndUpdate({"_id":task.assignedUser},
                    {$addToSet:{"pendingTasks":task._id}},{new:true},
                    function(err,user){
                        if(err){
                            console.log(err)
                        }else{
                            user.save(function(err){
                                console.log(err)
                            })
                            console.log(user)
                        }
                    })
                }
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
            );
        }else if(req.body.assignedUser !== undefined && req.body.assignedUser !== ""){
            newTask.assignedUser = req.body.assignedUser;
            User.findOne({"_id":newTask.assignedUser},function(err, user){
                if(err || user === null){
                    newTask.assignedUser = "";
                    newTask.assignedUserName = "unassigned";
                    newTask.save(function(err,task){
                        if(err){
                            console.log("failed with applied id and not found the user")
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
                }else{
                    newTask.assignedUserName = user.name;
                    newTask.save(function(err,task){
                        if(err){
                            console.log("failed with applied id  and found the user")
                            res.json({
                                message: "400 Bad Request",
                                data :{
                                    "name" : req.body.name || "",
                                    "email": req.body.deadline || "",
                                    "error": err.message
                                }
                            })
                        }else{
                            User.findOneAndUpdate({"_id":task.assignedUser},
                            {$addToSet:{"pendingTasks":task._id}},
                            {new:true},
                            function(err,u){
                                if(err){
                                    console.log("user updated? ")
                                }else{
                                    u.save(function(err){
                                        console.log(err)
                                    })
                                    console.log(u)
                                }
                            })
                        }
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
                    );
                }
            })
        }else if(req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
            newTask.assignedUserName = req.body.assignedUserName;
            User.findOne({"name":newTask.assignedUserName},function(err,user){
                if(err || user === null){
                    newTask.assignedUser = "";
                    newTask.assignedUserName = "unassigned";
                    newTask.save(function(err,task){
                        if(err){
                            console.log("failed with applied name and  not found the user")
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
                }else{
                    newTask.assignedUser = user._id;
                    newTask.save(function(err,task){
                        if(err){
                            console.log("failed with applied name and found the user")
                            res.json({
                                message: "400 Bad Request",
                                data :{
                                    "name" : req.body.name || "",
                                    "email": req.body.deadline || "",
                                    "error": err.message
                                }
                            })
                        }else{
                            User.findOneAndUpdate({"_id":task.assignedUser},
                            {$addToSet:{"pendingTasks":task._id}},
                            {new:true},
                            function(err,user){
                                if(err){
                                    console.log(err)
                                }else{
                                    user.save(function(err){
                                        console.log(err)
                                    })
                                    console.log(user)
                                }
                            })
                        }
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
                    );
                }
            })
        }else{
            newTask.assignedUser = "";
            newTask.assignedUserName = "unassigned";
            newTask.save(function(err,task){
                if(err){
                    console.log("failed with not applied name nor id")
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
        }
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
                        message: "200 Success",
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
                var oldName  = task.assignedUser;
                if(oldName !== ""){
                    User.findOneAndUpdate({"_id":oldName},
                    {$pull:{pendingTasks:task._id}},
                    function(err,doc){
                        if(err){
                            console.log(err)
                        }
                    })
                }
                task.name = req.body.name;
                task.description = (req.body.description === undefined)? "":req.body.description;
                task.deadline = req.body.deadline;
                task.completed = (req.body.completed === undefined)? false:req.body.completed;
                task.dateCreated = Date.now();
                //task.assignedUser = (req.body.assignedUser === undefined)? "":req.body.assignedUser;
                //task.assignedUserName = (req.body.assignedUserName === undefined)? "unassigned":req.body.assignedUserName;
                if(req.body.assignedUser !== undefined && req.body.assignedUser !== "" && req.body.assignedUserName !== undefined && req.body.assignedUserName !== ""){
                    task.assignedUserName = req.body.assignedUserName;
                    task.assignedUser = req.body.assignedUser;
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
                }else if(req.body.assignedUser !== undefined && req.body.assignedUser !== ""){
                    task.assignedUser = req.body.assignedUser;
                    User.findOne({"_id":task.assignedUser},function(err,user){
                        if(err || user === null){
                            task.assignedUser = "";
                            task.assignedUserName = "unassigned";
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
                        }else{
                            task.assignedUserName = user.name;
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
                            if(task.assignedUser !== "" && task.assignedUser!== undefined){
                                User.findOneAndUpdate({"_id":task.assignedUser},
                                {$addToSet:{pendingTasks:task._id}},
                                function(err,doc){
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            }
                        }
                    })
                }else if(req.body.assignedUserName !== undefined && req.body.assignedUserName !== "unassigned"){
                    task.assignedUserName = req.body.assignedUserName;
                    User.findOne({"name":task.assignedUserName},function(err, user){
                        if(err || user === null){
                            task.assignedUser = "";
                            task.assignedUserName = "unassigned";
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
                        }else{
                            task.assignedUser = user._id;
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
                            if(task.assignedUser !== "" && task.assignedUser!== undefined){
                                User.findOneAndUpdate({"_id":task.assignedUser},
                                {$addToSet:{pendingTasks:task._id}},
                                function(err,doc){
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            }
                        }
                    })
                }else{
                    task.assignedUserName = "unassigned";
                    task.assignedUser = "";
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
                    var user = task.assignedUser;
                    if(user !== ""){
                        User.findOneAndUpdate({"_id":user},
                        {$pull:{pendingTasks:task._id}},
                        function(err, doc){
                            if(err){
                                console.log(err)
                            }
                        })
                    }
                    res.json({
                        message: "200 Success",
                        data:task
                    })
                }
            }
        });
    })

    return router;
}
