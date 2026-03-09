import { useState, useEffect } from "react";
import Modal from "../components/Modal";
import { getBooks, createBook, updateBook, deleteBook } from "../api";
import { Library} from "lucide-react";


const EMPTY_FORM = {
  title: "", author: "", publisher: "", genre: "",
  isbn: "", year: "", total_copies: 1, cover_image: ""
};

const MOCK_BOOKS = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", isbn: "9780743273565", year: 1925, total_copies: 5, available_copies: 3, cover_image: "the-great-gatsby.jpg" },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "9780061935466", year: 1960, total_copies: 4, available_copies: 2, cover_image: "To Kill a Mockingbird.jpg" },
  { id: 3, title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", year: 1949, total_copies: 6, available_copies: 5, cover_image: "1984.jpg" },
  { id: 4, title: "Brave New World", author: "Aldous Huxley", genre: "Dystopian", isbn: "9780060850524", year: 1932, total_copies: 3, available_copies: 1, cover_image: "brave-new-world.jpg" },
  { id: 5, title: "The Catcher in the Rye", author: "J.D. Salinger", genre: "Fiction", isbn: "9780316769174", year: 1951, total_copies: 4, available_copies: 4, cover_image: "the-catcher-in-the-rye.jpg" },
];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBook, setEditBook] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("grid"); 

  const load = async () => {
    try {
      const data = await getBooks({ search });
      setBooks(Array.isArray(data) ? data : []);
    } catch {
      setBooks(MOCK_BOOKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => { setEditBook(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (book) => { setEditBook(book); setForm(book); setShowModal(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editBook) {
        const updated = await updateBook(editBook.id, form);
        setBooks((prev) => prev.map((b) => b.id === editBook.id ? updated : b));
      } else {
        const created = await createBook(form);
        setBooks((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      if (editBook) {
        setBooks((prev) => prev.map((b) => b.id === editBook.id ? { ...b, ...form } : b));
      } else {
        setBooks((prev) => [{ ...form, id: Date.now(), available_copies: parseInt(form.total_copies) }, ...prev]);
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try { await deleteBook(id); } catch {}
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const getCoverSrc = (filename) => {
    if (!filename) return null;
    return `/covers/${filename}`;
  };

  const filtered = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.isbn?.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Books</h1>
        <p className="page-subtitle">Manage your library's book inventory</p>
      </div>

      <div className="page-toolbar">
        <input
          type="text"
          placeholder="Search by title, author or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="view-toggle">
          <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>⊞ Grid</button>
          <button className={`view-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>☰ Table</button>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Book</button>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading books...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Library size={26} color="white" /></div>
          <p>No books found. Add your first book!</p>
        </div>
      ) : view === "grid" ? (
        <div className="books-grid">
          {filtered.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.cover_image ? (
                  <img
                    src={getCoverSrc(book.cover_image)}
                    alt={book.title}
                    onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                  />
                ) : null}
                <div className="book-cover-fallback" style={{ display: book.cover_image ? "none" : "flex" }}>
                  <Library size={26} color="white" />
                </div>
                <div className={`book-availability ${book.available_copies > 0 ? "available" : "unavailable"}`}>
                  {book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}
                </div>
              </div>
              <div className="book-card-info">
                <p className="book-card-title">{book.title}</p>
                <p className="book-card-author">{book.author}</p>
                <p className="book-card-genre"><span className="badge badge-info">{book.genre}</span></p>
                <div className="book-card-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>ISBN</th>
                <th>Year</th>
                <th>Copies</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className="table-cover">
                      {book.cover_image ? (
                        <img
                          src={getCoverSrc(book.cover_image)}
                          alt={book.title}
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <div className="table-cover-fallback"><Library size={24} /></div>
                      )}
                    </div>
                  </td>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td><span className="badge badge-info">{book.genre}</span></td>
                  <td className="mono">{book.isbn}</td>
                  <td>{book.year}</td>
                  <td>{book.total_copies}</td>
                  <td>
                    <span className={`badge ${book.available_copies > 0 ? "badge-success" : "badge-danger"}`}>
                      {book.available_copies}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(book)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(book.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <Modal title={editBook ? "Edit Book" : "Add New Book"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} placeholder="Book title" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Author</label>
                <input name="author" value={form.author} onChange={handleChange} placeholder="Author name" required />
              </div>
              <div className="form-group">
                <label>Publisher</label>
                <input name="publisher" value={form.publisher} onChange={handleChange} placeholder="Publisher" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Genre</label>
                <select name="genre" value={form.genre} onChange={handleChange} required>
                  <option value="">Select genre</option>
                  {["Fiction", "Non-Fiction", "Science", "History", "Biography", "Dystopian", "Mystery", "Romance", "Technology", "Philosophy"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Year</label>
                <input name="year" type="number" value={form.year} onChange={handleChange} placeholder="Publication year" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ISBN</label>
                <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="ISBN number" />
              </div>
              <div className="form-group">
                <label>Total Copies</label>
                <input name="total_copies" type="number" min="1" value={form.total_copies} onChange={handleChange} required />
              </div>
            </div>

            {/* Cover Image */}
            <div className="form-group">
              <label>Cover Image Filename</label>
              <input
                name="cover_image"
                value={form.cover_image}
                onChange={handleChange}
                placeholder="e.g. the-great-gatsby.jpg"
              />
              <p className="field-hint">Place your image file in the <code>public/covers/</code> folder and enter the filename here.</p>
            </div>

            {/* Preview */}
            {form.cover_image && (
              <div className="cover-preview">
                <p className="cover-preview-label">Preview:</p>
                <img
                  src={`/covers/${form.cover_image}`}
                  alt="Cover preview"
                  onError={(e) => { e.target.src = ""; e.target.alt = "Image not found — check filename"; }}
                />
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving..." : editBook ? "Save Changes" : "Add Book"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}