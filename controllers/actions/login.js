this.init = function(request, output)
{
    var instance = this;
 
    getSession(request, function(session)
    {
        var get = getQueryParameters(request);
        var post = getPostParameters(request);
        var adminAttempt = (get['admin_attempt']) ? true : false;
        
        var userDocument = createDocument('user', post);        
        
        getDBObjectsWithValues({object_type: 'user', $or: [{username: userDocument['username']}, {email: userDocument['username']}], password: userDocument['password']}, function(data)
        {
            if(data.length == 0)
            {
                instance.loginError(request, session, adminAttempt, output);
                return;
            }
            
            if(adminAttempt && data[0].admin == 0)
            {
                instance.loginError(request, session, adminAttempt, output);
                return;
            }
            
            delete data[0].password;
            session.user = data[0];
            editSession(request, session, [], function(data)
            {
                if(adminAttempt)
                {
                    output({redirect: pb.config.siteRoot + '/admin'});
                }
                else
                {
                    output({redirect: pb.config.siteRoot});
                }
            });
        });
    });
}

this.loginError = function(request, session, adminAttempt, output)
{
    session.error = '^loc_INVALID_LOGIN^';
    editSession(request, session, [], function(data)
    {
        if(adminAttempt)
        {
            output({redirect: pb.config.siteRoot + '/admin/login'});
            return;
        }
        
        output({redirect: pb.config.siteRoot + '/login'});
    });
}
