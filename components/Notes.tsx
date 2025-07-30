"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NODE_ENV === "development"
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/notes`
    : "/api/notes";

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
  const [message, setMessage] = useState<string | null>(null);

  /**
   * Fetches data from the API and updates the component state.
   */
  async function fetchData() {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setApiData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage(null);
        setNote(null);

        // After 3 seconds, refetch the data
        fetchData();
      }, 3000);
    }
  }, [message, note]);

  /**
   * Creates a new note by sending a POST request to the API.
   */
  async function createNote() {
    try {
      if (!note || !note.title || !note.content) {
        console.error("Error: Note title and content are required.");
        setMessage("Error: Note title and content are required.");
        return;
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      setMessage(
        data ? "Note created successfully!" : "Error: Failed to create note."
      );
      setNote({ id: 0, title: "", content: "" }); // Reset the form
      setApiData([...(apiData || []), data]);
    } catch (error) {
      console.error("Error creating note:", error);
      setMessage("Error: Failed to create note.");
    }
  }

  /**
   * Updates a note by sending a PUT request to the API.
   */
  async function updateNote(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(note),
      });
      const data = await response.json();
      setMessage(data.result);
      setApiData(
        apiData?.map(note => (note.id === id ? { ...note, ...note } : note)) ||
          []
      );
    } catch (error) {
      console.error("Error updating note:", error);
      setMessage("Error: Failed to update note.");
    }
  }

  /**
   * Deletes a note by sending a DELETE request to the API.
   */
  async function deleteNote(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      setMessage(data.result);
      setApiData(apiData?.filter(note => note.id !== id) || []);
    } catch (error) {
      console.error("Error deleting note:", error);
      setMessage("Error: Failed to delete note.");
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-screen items-center justify-center p-2 md:p-4">
      <h2 className="mb-4 text-xl font-bold">Add a New Note</h2>
      <div className="flex flex-col gap-4 w-full max-w-md text-sm md:text-base">
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
        <div className="flex justify-center items-center font-bold h-10">
          {message &&
            (message.startsWith("Error:") ? (
              <span className="text-red-500">{message}</span>
            ) : (
              <span className="text-green-500">{message}</span>
            ))}
        </div>
      </div>
      <div className="flex flex-col w-screen items-center justify-center p-2 md:p-4">
        <h2 className="mt-12 text-xl font-bold">Notes</h2>
        <div className="my-4 w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg shadow">
          {apiData ? (
            <div className="flex flex-col p-2 md:p-4 gap-4 w-full text-sm md:text-base">
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
                  className="flex justify-between items-center border-b border-gray-700 py-2 md:py-4 gap-2">
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
                      className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 rounded"
                      onClick={() => setNote(item)}>
                      {/* Edit */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5">
                        <path d="M3 17.25V21h3.75l11.14-11.14-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.42 1.42 3.75 3.75 1.42-1.42z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                      onClick={() => deleteNote(item.id)}>
                      {/* Delete */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5">
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 0 0-1 1v1H4a2 2 0 0 0-2 2v1h16V5a2 2 0 0 0-2-2h-1V3a1 1 0 0 0-1-1H6zm0 2h12v1H6V4zm0 3h12v1H6V7zm0 3h12v1H6v-1zm0 3h12v1H6v-1zm0 3h12v1H6v-1z"
                        />
                      </svg>
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
