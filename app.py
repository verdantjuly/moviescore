from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import uuid
import certifi
ca = certifi.where()
client = MongoClient(
    'mongodb+srv://nbcmini:uhuOjv23aS3dqSd0@cluster0.amazvbr.mongodb.net/?retryWrites=true&w=majority',tlsCAFile=ca)
db = client['nbc-mini']

app = Flask(__name__)

import requests
from bs4 import BeautifulSoup

uuid1 = str(uuid.uuid1())

@app.route("/save", methods=["POST"])
def save_post():
    url_receive = request.get_json()['url']
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
    data = requests.get(url_receive, headers=headers)
    soup = BeautifulSoup(data.text, 'html.parser')
    ogimage = soup.select_one('meta[property="og:image"]')['content']
    ogtitle = soup.select_one('meta[property="og:title"]')['content']
    ogdesc = soup.select_one('meta[property="og:description"]')['content']
    
    nickname_receive = request.get_json()['nickname']
    password_receive = request.get_json()['password']
    starPoint_receive = request.get_json()['starPoint']
    comment_receive = request.get_json()['comment']
    title_receive = ogtitle
    desc_receive = ogdesc[0:300]
    imageurl_receive = ogimage
    id_receive = uuid1
    doc = {
        'title':ogtitle,
        'desc':ogdesc,
        'imageurl':ogimage,
        'url' :url_receive,
        'comment':comment_receive,
        'starpoint' :starPoint_receive,
        'password' :password_receive,
        'nickname' :nickname_receive,
        'id' :id_receive
    }
    db.movies.insert_one(doc)

    return jsonify(1)


@app.route('/')
def home():
    
    return render_template('index.html')
       


@app.route("/get-list", methods=["GET"])
def allgetlist():
    fantext_list = list(db.movies.find({}, {'_id': 0}))
    return jsonify(fantext_list)
    
@app.route("/update", methods=["POST"])
def update_post():
    request_data = request.get_json()
    url_receive = request_data['doc']['url']

    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'}
    data = requests.get(url_receive, headers=headers)
    soup = BeautifulSoup(data.text, 'html.parser')
    ogimage = soup.select_one('meta[property="og:image"]')['content']
    ogtitle = soup.select_one('meta[property="og:title"]')['content']
    ogdesc = soup.select_one('meta[property="og:description"]')['content']

    nickname_receive = request_data['doc']['nickname']
    password_receive = request_data['doc']['password']
    starPoint_receive = request_data['doc']['starPoint']
    comment_receive = request_data['doc']['comment']
    desc_receive = ogdesc[0:300]
    id_receive = request_data['auth']['id']
    uuid_receive= id_receive.split(',')[0]
    print(uuid_receive)

    result=db.movies.update_one({'id':uuid_receive}, {'$set':
        {
        'title':ogtitle,
        'desc':desc_receive,
        'imageurl':ogimage,
        'url' :url_receive,
        'comment':comment_receive,
        'starpoint' :starPoint_receive,
        'password' :password_receive,
        'nickname' :nickname_receive,
    }})

    return jsonify(result.modified_count)

@app.route("/auth", methods=["POST"])
def auth():
    print(request.get_json())
    reid = request.get_json()['id']
    repw = request.get_json()['password']

    return jsonify(db.movies.find_one({'id': reid, 'password': repw}, {'_id': 0}))

@app.route("/del", methods=["POST"])
def movie_del():
    allmovie = request.get_json()
    reid = allmovie['id']
    repw = allmovie['password']
    db.movies.delete_one({'id':reid,'password':repw})
    return jsonify(1)


if __name__ == '__main__':
    app.run('0.0.0.0', port=5001, debug=True)
