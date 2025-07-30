from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
CORS(app)

# Configure the SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///notes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define the Note model
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/api/notes', methods=['POST'])
def add_note():
    """
    Creates a new note.
    ---
    post:
      summary: Creates a new note.
      description: Creates a new note with the given title and content.
      requestBody:
        description: The note to add.
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - content
              properties:
                title:
                  type: string
                  description: The title of the note.
                content:
                  type: string
                  description: The content of the note.
      responses:
        201:
          description: The note has been created.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    description: The ID of the note.
                  title:
                    type: string
                    description: The title of the note.
                  content:
                    type: string
                    description: The content of the note.
        400:
          description: A note without title and content was provided.
    """
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({'error': 'Title and content required'}), 400
    note = Note(title=data['title'], content=data['content'])
    db.session.add(note)
    db.session.commit()
    return jsonify({'id': note.id, 'title': note.title, 'content': note.content}), 201

@app.route('/api/notes', methods=['GET'])
def list_notes():
    """
    Lists all notes.
    ---
    get:
      summary: Lists all notes.
      description: Lists all notes.
      responses:
        200:
          description: A list of notes.
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      description: The ID of the note.
                    title:
                      type: string
                      description: The title of the note.
                    content:
                      type: string
                      description: The content of the note.
    """
    notes = Note.query.all()
    result = [{'id': n.id, 'title': n.title, 'content': n.content} for n in notes]
    return jsonify(result)

@app.route('/api/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """
    Gets a note by its ID.
    ---
    get:
      summary: Gets a note by its ID.
      description: Gets a note by its ID.
      parameters:
        - in: path
          name: note_id
          required: true
          schema:
            type: integer
          description: The ID of the note to get.
      responses:
        200:
          description: The note.
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: integer
                    description: The ID of the note.
                  title:
                    type: string
                    description: The title of the note.
                  content:
                    type: string
                    description: The content of the note.
        404:
          description: Note not found.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    description: The error message.
    """
    note = Note.query.get(note_id)
    if note is None:
        return jsonify({'error': 'Note not found'}), 404
    return jsonify({'id': note.id, 'title': note.title, 'content': note.content})

@app.route('/api/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """
    Updates a note by its ID.
    ---
    put:
      summary: Updates a note by its ID.
      description: Updates a note by its ID.
      parameters:
        - in: path
          name: note_id
          required: true
          schema:
            type: integer
          description: The ID of the note to update.
      requestBody:
        description: The note to update.
        content:
          application/json:
            schema:
              type: object
              required:
                - title
                - content
              properties:
                title:
                  type: string
                  description: The title of the note.
                content:
                  type: string
                  description: The content of the note.
      responses:
        200:
          description: The note has been updated.
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    type: string
                    description: The result of the update.
        400:
          description: A note without title and content was provided.
        404:
          description: Note not found.
    """
    note = Note.query.get(note_id)
    if note is None:
        return jsonify({'error': 'Note not found'}), 404
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({'error': 'Title and content required'}), 400
    note.title = data['title']
    note.content = data['content']
    db.session.commit()
    return jsonify({'result': 'Updated'})

@app.route('/api/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """
    Deletes a note by its ID.
    ---
    delete:
      summary: Deletes a note by its ID.
      description: Deletes a note by its ID.
      parameters:
        - in: path
          name: note_id
          required: true
          schema:
            type: integer
          description: The ID of the note to delete.
      responses:
        200:
          description: The note has been deleted.
          content:
            application/json:
              schema:
                type: object
                properties:
                  result:
                    type: string
                    description: The result of the deletion.
        404:
          description: Note not found.
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
                    description: The error message.
    """
    note = Note.query.get(note_id)
    if note:
        db.session.delete(note)
        db.session.commit()
        return jsonify({'result': 'Deleted'})
    return jsonify({'error': 'Note not found'}), 404

def handler(environ, start_response):
    """
    WSGI handler for the application.

    Calls the app with the environ and start_response arguments.

    Parameters:
        environ (dict): The WSGI environment.
        start_response (function): The WSGI start response function.

    Returns:
        The response from the app.
    """
    return app(environ, start_response)


