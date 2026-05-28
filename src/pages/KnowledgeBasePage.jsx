
import { useState, useEffect } from "react";
import api from "../services/api";
import { Plus, Search, Trash2, Edit2, Save, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const KnowledgeBasePage = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    keywords: "",
    category: "General"
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get("/admin/kb");
      setEntries(response.data);
    } catch (error) {
      console.error("Failed to fetch KB entries", error);
      const msg = error.response?.data?.error || error.message || "Failed to load knowledge base";
      toast.error(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        question: entry.question,
        answer: entry.answer,
        keywords: Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "",
        category: entry.category
      });
    } else {
      setEditingEntry(null);
      setFormData({
        question: "",
        answer: "",
        keywords: "",
        category: "General"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const keywordsArray = formData.keywords.split(",").map(k => k.trim()).filter(k => k);
    
    const payload = {
      ...formData,
      keywords: keywordsArray
    };

    try {
      if (editingEntry) {
        await api.put(`/admin/kb/${editingEntry.id}`, payload);
        toast.success("Entry updated successfully");
      } else {
        await api.post("/admin/kb", payload);
        toast.success("New entry added");
      }
      setIsModalOpen(false);
      fetchEntries();
    } catch (error) {
      console.error("Failed to save entry", error);
      toast.error("Failed to save entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/admin/kb/${id}`);
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      console.error("Failed to delete entry", error);
      toast.error("Failed to delete entry");
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (Array.isArray(entry.keywords) && entry.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbot Knowledge Base</h1>
          <p className="text-gray-500">Train the AI assistant with questions and answers.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add New Question
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search questions, answers, or keywords..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading knowledge base...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No entries found. Add some questions to train the bot!</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.category === 'Payment' ? 'bg-green-100 text-green-800' :
                        entry.category === 'Result' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{entry.question}</h3>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{entry.answer}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(entry.keywords) && entry.keywords.map((keyword, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(entry)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingEntry ? "Edit Knowledge Entry" : "Add New Knowledge Entry"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question / User Query</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. How do I buy a token?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bot Answer</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="The answer the bot should give..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="Payment">Payment</option>
                    <option value="Result">Result</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="buy, token, pay (comma separated)"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                >
                  <Save size={18} />
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
