from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def now():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    level = db.Column(db.String(10))
    department = db.Column(db.String(100))
    created_at = db.Column(db.DateTime(timezone=True), default=now)

    documents = db.relationship("Document", backref="owner", cascade="all, delete-orphan")
    notes = db.relationship("Note", backref="author", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "level": self.level,
            "department": self.department,
        }


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    stored_name = db.Column(db.String(255), nullable=False)
    size_bytes = db.Column(db.Integer, default=0)
    last_page = db.Column(db.Integer, default=1)
    total_pages = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=now)

    notes = db.relationship("Note", backref="document")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "size_bytes": self.size_bytes,
            "last_page": self.last_page,
            "total_pages": self.total_pages,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    document_id = db.Column(db.Integer, db.ForeignKey("documents.id"), nullable=True)
    title = db.Column(db.String(150), nullable=False)
    body = db.Column(db.Text, default="")
    page = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=now)
    updated_at = db.Column(db.DateTime(timezone=True), default=now, onupdate=now)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "body": self.body,
            "page": self.page,
            "document_id": self.document_id,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }