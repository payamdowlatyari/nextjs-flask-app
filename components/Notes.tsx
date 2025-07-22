"use client";

import { useEffect, useState } from "react";

/**
 * Represents a note with an id, title, and content.
 */
type Note = {
  id: number;
  title: string;
  content: string;
};

/**
 * A component that fetches data from the API and displays a list of notes.
 *
 * This component fetches data from the API when it mounts and displays a list of notes.
 * If the response from the API is ok, it logs the data to the console and updates the component state.
 * If the response is not ok, it logs an error to the console.
 */
export default function Notes() {
  const [apiData, setApiData] = useState<Note[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    /**
     * Fetches data from the API and updates the component state.
     */
    async function fetchData() {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:5328/notes");
        const data = await response.json();
        setApiData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  /**
   * Creates a new note by sending a POST request to the API.
   */
  async function createNote() {
    try {
      if (!note || !note.title || !note.content) {
        console.error("Note title and content are required.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5328/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      setApiData([...(apiData || []), data]);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  /**
   * Updates a note by sending a PUT request to the API.
   */
  async function updateNote(id: number) {
    try {
      const response = await fetch(`http://127.0.0.1:5328/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      setApiData(apiData?.map(note => (note.id === id ? data : note)) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  /**
   * Deletes a note by sending a DELETE request to the API.
   */
  async function deleteNote(id: number) {
    try {
      const response = await fetch(`http://127.0.0.1:5328/notes/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setApiData(apiData?.filter(note => note.id !== id) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-screen items-center justify-center p-4">
      <h2 className="mb-4 text-xl font-bold">Add a New Note</h2>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-900"
          type="text"
          placeholder="Title"
          value={note?.title}
          onChange={e =>
            setNote({
              id: note?.id ?? 0,
              title: e.target.value,
              content: note?.content ?? "",
            })
          }
        />
        <input
          className="border border-gray-300 rounded-md p-2 bg-gray-100 text-gray-900"
          type="text"
          placeholder="Content"
          value={note?.content}
          onChange={e =>
            setNote({
              id: note?.id ?? 0,
              title: note?.title ?? "",
              content: e.target.value,
            })
          }
        />
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => (note?.id ? updateNote(note.id) : createNote())}>
          {note?.id ? "Update" : "Create"}
        </button>
        <button
          type="button"
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setNote({ id: 0, title: "", content: "" })}>
          Clear
        </button>
      </div>
      <div className="flex flex-col w-screen items-center justify-center p-4">
        <h2 className="mb-4 mt-12 text-xl font-bold">Notes</h2>
        <div className="my-12 w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg shadow">
          {apiData ? (
            <div className="flex flex-col p-4 gap-4 w-full">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2 gap-2">
                <div className="flex flex-wrap text-gray-400">
                  <p className="font-bold mx-2">ID</p>
                  <p className="font-bold mx-4">Title</p>
                  <p className="font-bold mx-2">Content</p>
                </div>
              </div>
              {apiData.map((item: Note) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center border-b border-gray-700 py-4 gap-2">
                  <div className="flex flex-wrap">
                    <p className="font-semibold mx-2 text-gray-400">
                      {item.id}
                    </p>
                    <p className="font-semibold mx-4">{item.title}</p>
                    <p className="mx-2">{item.content}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => setNote(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      onClick={() => deleteNote(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      </div>
    </div>
  );
}
