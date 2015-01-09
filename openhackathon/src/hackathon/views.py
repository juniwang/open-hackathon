import uuid
from flask import request, Response, render_template, flash, redirect, session, url_for, g
from flask.ext.restful import Api, Resource
from hackathon import app
from functions import *
from routes import *
from database import User
from login import *
from constants import *
from log import log
from flask.ext.login import login_required, LoginManager, logout_user, current_user
from datetime import timedelta
import admin

api = Api(app)
login_manager = LoginManager()
login_manager.login_view = "index"
login_manager.login_message_category = "info"
login_manager.setup_app(app)

session_lifetime_minutes = safe_get_config("login/session_minutes", 60)
PERMANENT_SESSION_LIFETIME = timedelta(minutes=session_lifetime_minutes)

@login_manager.user_loader
def load_user(id):
    return User.query.filter_by(id=int(id)).first()

# index page
@app.route('/')
@app.route('/index')
def index():
    next = request.args.get("next")
    if next is not None:
        session["next"] = next
    return render_template("index.html", providers=safe_get_config("login/provider_enabled", ["github"]))

# error handler for 404
@app.errorhandler(404)
def page_not_found(error):
    # render a beautiful 404 page
    log.error(error)
    return "Page not Found", 404

# error handler for 500
@app.errorhandler(500)
def internal_error(error):
    # render a beautiful 500 page
    log.error(error)
    return "Internal Server Error", 500

# simple webPages. login required
@app.route('/<path:path>')
@login_required
def template_routes(path):
    # session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=session_lifetime_minutes)
    return simple_route(path)

# js config
@app.route('/config.js')
def js_config():
    resp =  Response(response="var CONFIG=%s" % json.dumps(get_config("javascript")),
                     status=200,
                     mimetype="application/javascript")
    return resp

@app.route('/github')
def github():
    try:
        return GithubLogin().github_authorized()
    except Exception as err:
        log.error(err)
        return "Internal Server Error", 500

@app.route('/qq')
def qq():
    try:
        return QQLogin().qq_authorized()
    except Exception as err:
        log.error(err)
        return "Internal Server Error", 500

# @hackathon.route('/renren')
def renren():
    url_ori = request.url
    #if (url.ori.find('access_token') < 0) return render_template("renren.html",iden=url_ori,name='bb')
    if (len(url_ori)<50):
        return render_template("renren.html",iden=url_ori,name='bb')
    start = url_ori.index('=')
    end = url_ori.index('&')
    #Str = request.query_string
    access_token = url_ori[start+1:end]
    url = '/v2/user/get?access_token=' + access_token
    # httpres = query_info('api.renren.com',url,2)
    # #info = httpres.read()
    # info = json.loads(httpres.read())
    # name = 'renren' + str(info['response']['id'])
    # uid = str(uuid.uuid3(uuid.NAMESPACE_DNS,name))
    # query = db_session.query(User)
    # result = query.filter(User.uid == uid).first()
    #result = session.query(User).filter(User.uid == uid).all()
    # if (result == None):
    #     u = User(info['response']['name'],uid,'renren')
        # db_session.add(u)
        # db_session.commit()
    #info = Str
    return render_template("renren.html")
    #return render_template("renren.html",iden=url_ori,name='cc')
    # return render_template("renren.html",pic = info['response']['avatar'][0]['url'],name=info['response']['name'])

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.before_request
def before_request():
    g.user = current_user
    # session.permanent = True
    app.permanent_session_lifetime = timedelta(minutes=session_lifetime_minutes)

api.add_resource(CourseList, "/api/courses")
api.add_resource(DoCourse, "/api/course/<id>")
api.add_resource(StatusList, "/api/registerlist")
api.add_resource(Anmt, "/api/announcement")