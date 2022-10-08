# -*- coding: utf-8 -*-

import os
from dotenv import load_dotenv
from datetime import datetime

from flask import Flask, Markup, render_template, redirect, url_for, jsonify, flash, session, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.types import INTEGER, FLOAT, TEXT, DATETIME
from markdown import markdown
from bleach import clean

from libs import (
    score_text,
    focus_emotional_words,
    convert_emotion_value_to_text,
    convert_emotion_value_to_rgba,
    debug,
    convert_posts_to_wordcloud,
    convert_text_to_wakati,
    format_time_delta,
)

load_dotenv()

USER_NAME = os.environ['LOGIN_USER_NAME']
PASSWORD = os.environ['LOGIN_PASSWORD']

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['SECRET_KEY']


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db/post.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column('id', INTEGER, primary_key=True)
    content = db.Column('content', TEXT, nullable=False)
    emotion_value = db.Column('emotion_value', FLOAT, nullable=False)
    created_at = db.Column('created_at', DATETIME, nullable=False)
    send_from = db.Column('send_from', TEXT, nullable=False)
    wakati = db.Column('wakati', TEXT, nullable=False)


def login_required(func):
    def wrapper(*args, **kwargs):
        if session.get('login'):
            return func(*args, **kwargs)
        else:
            return render_template('index.html')
    wrapper.__name__ = func.__name__
    return wrapper


def create_template(posts=None):
    if posts is None:
        posts = reversed(Post.query.order_by('created_at').all())
    return render_template('post_template.html',
                           posts=posts,
                           now=datetime.now(),
                           formatter=format_time_delta,
                           classifier=convert_emotion_value_to_text,
                           layer=convert_emotion_value_to_rgba,
                           decorator=focus_emotional_words,
                           enumerate=enumerate,
                           )


@app.route('/')
def index():
    html = create_template(),
    svg = convert_posts_to_wordcloud(Post.query.order_by('created_at').all()),
    return render_template('index.html',
                           html=Markup(html[0]),
                           svg=Markup(svg[0]),
                           )


@app.route('/login', methods=['POST'])
def login():
    if request.form.get('username') == USER_NAME and\
        request.form.get('password') == PASSWORD:
        session['login'] = True
    else:
        flash('ユーザ名もしくはパスワードが間違っています')
    return redirect(url_for('index'))


@app.route('/logout')
def logout():
    session['login'] = False
    return redirect(url_for('index'))


@app.route('/newpost/', methods=['GET'])
def newpost():
    content = request.args.get('content', '')

    if not 0 < len(content) < 140:
        return jsonify({'test': '投稿は1文字以上140字以下に制限されています．'})

    # sanitizing
    content = clean(content, tags=['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'q', 'big', 'b', 'small', 'i', 'u', 'tt', 'strike'])

    new_post = Post(content=content,
                    emotion_value=round(score_text(content), 3),
                    created_at=datetime.now(),
                    send_from=request.remote_addr,
                    wakati=convert_text_to_wakati(content),
                    )

    db.session.add(new_post)
    db.session.commit()
    session['draft'] = ''

    return jsonify(
        {'html': create_template(),
         'wordcloud': convert_posts_to_wordcloud(Post.query.order_by('created_at').all()),
         'color': convert_emotion_value_to_rgba(new_post.emotion_value, 6),
         'animation': focus_emotional_words(content)
         })


@app.route('/delpost/<int:post_id>/', methods=['POST'])
def delpost(post_id):
    db.session.delete(Post.query.get(post_id))
    db.session.commit()
    return jsonify()


@app.route('/sort_post/')
def sort_post():
    method = request.args.get('method', 'date-asc')
    if method == 'date-asc':
        posts = reversed(Post.query.order_by('created_at').all())
    if method == 'date-desc':
        posts = Post.query.order_by('created_at').all()
    if method == 'emotion-asc':
        posts = reversed(Post.query.order_by('emotion_value').all())
    if method == 'emotion-desc':
        posts = Post.query.order_by('emotion_value').all()
    return jsonify({'data': create_template(posts)})


@app.route('/about')
def about():
    return render_template('about.html')


@app.route('/note')
def note():
    import os
    print(os.getcwd())
    with open('forum/static/note.md', encoding='u8') as f:
        return Markup(markdown(f.read()))


if __name__ == '__main__':
    app.run()
