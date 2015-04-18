
module.exports = function(paths){
    return function(req, res, next) {
        if(req.isAuthenticated()){
            next();
        }else if(paths.indexOf(req.path)>=0){
            next();
        }else{
            var err = new Error('Please authenticate.')
            err.status = 401;
            return next(err);
        }
    };
}
