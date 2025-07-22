from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# In-memory storage
notes = []
note_id = 1

# This code is a simple Flask application that provides a RESTful API for managing notes.
# It allows you to add, list, retrieve, and delete notes. The notes are stored in memory,
# so they will be lost when the application is restarted. The API endpoints are:
# - POST /notes: Add a new note with a title and content.
# - GET /notes: List all notes.
# - GET /notes/<note_id>: Retrieve a specific note by its ID.
# - PUT /notes/<note_id>: Update a specific note by its ID.
# - DELETE /notes/<note_id>: Delete a specific note by its ID.
# The application runs in debug mode, which is useful for development but should be turned off in
# production. The notes are stored in a list, and each note has a unique ID that
# is automatically assigned when a new note is created. The application returns JSON responses
# for all requests, making it easy to integrate with frontend applications or other services.
# The code is structured to handle errors gracefully, returning appropriate HTTP status codes
# and error messages when necessary. The use of global variables for note storage is a simple
# approach for demonstration purposes, but in a production application, you would typically use
# a database to persist data across application restarts.

@app.route('/notes', methods=['POST'])
def add_note():
    """
    Add a new note with a title and content.
    
    The request body must contain a JSON object with a title and content field.
    The response will be a JSON object representing the newly created note, with
    an ID automatically assigned.
    If the request body is invalid, a 400 error is returned with an error message.
    """
    global note_id
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({'error': 'Title and content required'}), 400
    note = {
        'id': note_id,
        'title': data['title'],
        'content': data['content']
    }
    notes.append(note)
    note_id += 1
    return jsonify(note), 201

@app.route('/notes', methods=['GET'])
def list_notes():
    """
    List all notes.
    
    Returns a JSON array of all notes, with each note containing an ID, title, and content.
    """
    return jsonify(notes)

@app.route('/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """
    Get a note by ID.

    Returns a JSON object representing the note with the given ID, containing
    an ID, title, and content.
    If no note with the given ID exists, a 404 error is returned with an error
    message.
    """
    for note in notes:
        if note['id'] == note_id:
            return jsonify(note)
    return jsonify({'error': 'Note not found'}), 404
    
@app.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """
    Update a note by ID.
    
    Returns a JSON object with a result message.
    If no note with the given ID exists, a 404 error is returned with an error
    message.
    """
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data:
        return jsonify({'error': 'Title and content required'}), 400
    for note in notes:
        if note['id'] == note_id:
            note['title'] = data['title']
            note['content'] = data['content']
            return jsonify({'result': 'Updated'})
    return jsonify({'error': 'Note not found'}), 404

@app.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """
    Delete a note by ID.
    
    Returns a JSON object with a result message.
    If no note with the given ID exists, the response is still 200 OK but the
    result message is "Deleted if existed".
    """
    global notes
    notes = [note for note in notes if note['id'] != note_id]
    return jsonify({'result': 'Deleted if existed'})

if __name__ == '__main__':
    app.run(debug=True)

