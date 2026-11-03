import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Document, Note
from auth import error

library_bp = Blueprint("library", __name__, url_prefix="/api/library")

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
MAX_SIZE = 20 * 1024 * 1024  # 20 MB


@library_bp.route("", methods=["POST"])
@jwt_required()
def upload():
    user_id = int(get_jwt_identity())
    file = request.files.get("file")
    if file is None or file.filename == "":
        return error("Please choose a PDF file.", 400)
    if not file.filename.lower().endswith(".pdf") or file.read(5) != b"%PDF-":
        return error("Only PDF files are allowed.", 400)

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_SIZE:
        return error("That file is too big. The limit is 20 MB.", 400)

    title = (request.form.get("title") or "").strip() or os.path.splitext(file.filename)[0]
    stored_name = uuid.uuid4().hex + ".pdf"
    file.save(os.path.join(UPLOAD_FOLDER, stored_name))

    doc = Document(user_id=user_id, title=title[:200], stored_name=stored_name, size_bytes=size)
    db.session.add(doc)
    db.session.commit()
    return jsonify({"document": doc.to_dict()}), 201


@library_bp.route("", methods=["GET"])
@jwt_required()
def list_documents():
    user_id = int(get_jwt_identity())
    docs = Document.query.filter_by(user_id=user_id).order_by(Document.created_at.desc()).all()
    return jsonify({"documents": [d.to_dict() for d in docs]})


@library_bp.route("/<int:doc_id>", methods=["DELETE"])
@jwt_required()
def delete_document(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if doc is None:
        return error("Document not found.", 404)
    path = os.path.join(UPLOAD_FOLDER, doc.stored_name)
    if os.path.exists(path):
        os.remove(path)
    Note.query.filter_by(document_id=doc_id).delete()
    db.session.delete(doc)
    db.session.commit()
    return jsonify({"message": "Deleted"})

@library_bp.route("/<int:doc_id>/file", methods=["GET"])
@jwt_required()
def get_file(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if doc is None:
        return error("Document not found.", 404)
    return send_from_directory(UPLOAD_FOLDER, doc.stored_name, mimetype="application/pdf")


@library_bp.route("/<int:doc_id>/progress", methods=["PATCH"])
@jwt_required()
def save_progress(doc_id):
    user_id = int(get_jwt_identity())
    doc = Document.query.filter_by(id=doc_id, user_id=user_id).first()
    if doc is None:
        return error("Document not found.", 404)

    data = request.get_json(silent=True) or {}
    total = data.get("total_pages")
    page = data.get("last_page")
    if not isinstance(total, int) or total < 1:
        return error("Invalid total pages.", 400)
    if not isinstance(page, int) or page < 1 or page > total:
        return error("Invalid page number.", 400)

    doc.total_pages = total
    doc.last_page = page
    db.session.commit()
    return jsonify({"document": doc.to_dict()})
def get_owned_doc(doc_id):
    user_id = int(get_jwt_identity())
    return Document.query.filter_by(id=doc_id, user_id=user_id).first()


@library_bp.route("/<int:doc_id>/notes", methods=["GET"])
@jwt_required()
def list_notes(doc_id):
    doc = get_owned_doc(doc_id)
    if doc is None:
        return error("Document not found.", 404)
    notes = Note.query.filter_by(document_id=doc.id).order_by(Note.page, Note.created_at).all()
    return jsonify({"notes": [n.to_dict() for n in notes]})

@library_bp.route("/<int:doc_id>/notes", methods=["POST"])
@jwt_required()
def add_note(doc_id):
    doc = get_owned_doc(doc_id)
    if doc is None:
        return error("Document not found.", 404)

    data = request.get_json(silent=True) or {}
    page = data.get("page")
    content = (data.get("content") or "").strip()
    if not isinstance(page, int) or page < 1 or (doc.total_pages and page > doc.total_pages):
        return error("Invalid page number.", 400)
    if not content:
        return error("Please write something first.", 400)
    if len(content) > 2000:
        return error("Notes can be at most 2000 characters.", 400)

    note = Note(
        user_id=doc.user_id,
        document_id=doc.id,
        title=content[:60],
        body=content,
        page=page,
    )
    db.session.add(note)
    db.session.commit()
    return jsonify({"note": note.to_dict()}), 201


@library_bp.route("/<int:doc_id>/notes/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(doc_id, note_id):
    doc = get_owned_doc(doc_id)
    if doc is None:
        return error("Document not found.", 404)
    note = Note.query.filter_by(id=note_id, document_id=doc.id).first()
    if note is None:
        return error("Note not found.", 404)
    db.session.delete(note)
    db.session.commit()
    return jsonify({"message": "Deleted"})