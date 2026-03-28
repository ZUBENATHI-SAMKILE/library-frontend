import { useState, useEffect } from "react";
import { browseBooks, makeReservation } from "../../api";
import { BookOpen } from "lucide-react";

const getCoverSrc = (cover) => {
  if (!cover) return null;
  return cover.startsWith("http") ? cover : `/covers/${cover}`;
};

export default function BrowseBooks() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await browseBooks({ search, genre });
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search, genre]);

  const handleReserve = async (bookId) => {
    setReserving(bookId);
    try {
      await makeReservation(bookId);
      setMessage("✅ Reservation made successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || "Could not reserve book."));
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setReserving(null);
    }
  };

  const GENRES = ["", "Fiction", "Non-Fiction", "Science", "History", "Biography", "Dystopian", "Mystery", "Romance", "Technology", "Philosophy"];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Browse <span>Books</span></h1>
        <p className="page-subtitle">Search and reserve books from our collection</p>
      </div>

      {message && (
        <div className={`message-bar ${message.startsWith("✅") ? "success" : "danger"}`}>
          {message}
        </div>
      )}

      <div className="page-toolbar">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: "auto" }}>
          {GENRES.map((g) => <option key={g} value={g}>{g || "All Genres"}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading books...</p></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><BookOpen size={48} /></div>
          <p>No books found.</p>
        </div>
      ) : (
        <div className="member-books-grid">
          {books.map((book) => (
            <div key={book.id} className="member-book-card">
              <div className="member-book-cover">
                {book.cover_image ? (
                  <img
                    src={getCoverSrc(book.cover_image)}
                    alt={book.title}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <div className="member-book-fallback">
                    <BookOpen size={48} color="white" />
                  </div>
                )}
                <div className={`book-avail ${book.available_copies > 0 ? "available" : "unavailable"}`}>
                  {book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}
                </div>
              </div>
              <div className="member-book-info">
                <p className="member-book-title">{book.title}</p>
                <p className="member-book-author">{book.author}</p>
                <p className="member-book-genre">
                  <span className="badge badge-info">{book.genre}</span>
                </p>
                <button
                  className={`btn btn-sm ${book.available_copies > 0 ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => handleReserve(book.id)}
                  disabled={reserving === book.id}
                >
                  {reserving === book.id ? "Reserving..." : book.available_copies > 0 ? "Reserve" : "Join Waitlist"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}