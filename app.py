import os
from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

database_url = os.environ.get("DATABASE_URL")
if database_url:
    # DigitalOcean and some providers use postgres:// but SQLAlchemy requires postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
else:
    raise RuntimeError("DATABASE_URL environment variable is required")

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, unique=True)
    password_hash = db.Column(db.String)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    profile_image_url = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)


class Query(db.Model):
    __tablename__ = "queries"
    id = db.Column(db.Integer, primary_key=True)
    query_text = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    hits = db.relationship("Hit", backref="query", lazy=True)


class Hit(db.Model):
    __tablename__ = "hits"
    id = db.Column(db.Integer, primary_key=True)
    query_id = db.Column(db.Integer, db.ForeignKey("queries.id"))
    title = db.Column(db.Text, nullable=False)
    url = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    rank = db.Column(db.Integer, nullable=False)


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"message": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    if "user_id" not in session:
        return None
    return User.query.get(session["user_id"])


@app.route("/api/auth/user")
def auth_user():
    user = get_current_user()
    if not user:
        return jsonify({"message": "Unauthorized"}), 401
    return jsonify({
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "profileImageUrl": user.profile_image_url
    })


@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"message": "Email already registered"}), 400
    
    import uuid
    user = User(
        id=str(uuid.uuid4()),
        email=email,
        password_hash=generate_password_hash(password),
        first_name=first_name,
        last_name=last_name
    )
    db.session.add(user)
    db.session.commit()
    
    session["user_id"] = user.id
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "profileImageUrl": user.profile_image_url
    })


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash:
        return jsonify({"message": "Invalid email or password"}), 401
    
    if not check_password_hash(user.password_hash, password):
        return jsonify({"message": "Invalid email or password"}), 401
    
    session["user_id"] = user.id
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "profileImageUrl": user.profile_image_url
    })


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})


@app.route("/api/search", methods=["POST"])
@login_required
def search():
    data = request.get_json()
    query_text = data.get("query", "")
    
    if not query_text:
        return jsonify({"message": "Query is required"}), 400
    
    user = get_current_user()
    
    query_record = Query(
        query_text=query_text,
        user_id=user.id if user else None
    )
    db.session.add(query_record)
    db.session.commit()
    
    mock_results = [
        {
            "title": f"Result 1 for: {query_text}",
            "url": f"https://example.com/result1?q={query_text}",
            "description": f"This is the first result for your search query about {query_text}.",
            "rank": 1
        },
        {
            "title": f"Result 2 for: {query_text}",
            "url": f"https://example.com/result2?q={query_text}",
            "description": f"Another relevant result about {query_text} with more information.",
            "rank": 2
        },
        {
            "title": f"Result 3 for: {query_text}",
            "url": f"https://example.com/result3?q={query_text}",
            "description": f"Third result containing information related to {query_text}.",
            "rank": 3
        }
    ]
    
    for result in mock_results:
        hit = Hit(
            query_id=query_record.id,
            title=result["title"],
            url=result["url"],
            description=result["description"],
            rank=result["rank"]
        )
        db.session.add(hit)
    
    db.session.commit()
    
    return jsonify({
        "query": query_text,
        "results": mock_results
    })


@app.route("/api/history")
@login_required
def history():
    user = get_current_user()
    queries = Query.query.filter_by(user_id=user.id).order_by(Query.created_at.desc()).limit(20).all()
    
    history_list = []
    for q in queries:
        history_list.append({
            "id": q.id,
            "queryText": q.query_text,
            "createdAt": q.created_at.isoformat() if q.created_at else None
        })
    
    return jsonify(history_list)


with app.app_context():
    db.create_all()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8089, debug=False)
