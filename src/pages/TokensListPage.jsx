import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchTokens } from "../services/api";

const statusFilters = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Expired", value: "EXPIRED" },
  { label: "Exhausted", value: "EXHAUSTED" },
  { label: "Disabled", value: "DISABLED" }
];

const TokensListPage = () => {
  const [tokens, setTokens] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadTokens = async () => {
      setLoading(true);
      setNotice("");
      try {
        const data = await fetchTokens();
        if (!active) {
          return;
        }
        setTokens(data || []);
      } catch (error) {
        if (!active) {
          return;
        }
        setNotice(
          error?.response?.data?.error || "Unable to load token list."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    loadTokens();
    return () => {
      active = false;
    };
  }, []);

  const filteredTokens = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tokens.filter((token) => {
      const matchesStatus = status === "ALL" || token.status === status;
      if (!matchesStatus) {
        return false;
      }
      if (!term) {
        return true;
      }
      const studentName = token.Student?.fullName || "";
      const registration = token.Student?.registrationNumber || "";
      return (
        token.tokenCode?.toLowerCase().includes(term) ||
        studentName.toLowerCase().includes(term) ||
        registration.toLowerCase().includes(term)
      );
    });
  }, [tokens, search, status]);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "—";

  return (
    <div className="card">
      <div className="page-header">
        <div>
          <h2>Token List</h2>
          <p>View generated tokens and usage history.</p>
        </div>
        <div className="stat-chip">{filteredTokens.length} tokens</div>
      </div>
      {notice ? <div className="notice">{notice}</div> : null}
      <div className="toolbar">
        <input
          className="input search-input"
          type="text"
          placeholder="Search by token, student name, or registration"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="input"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {statusFilters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
        <Link className="button secondary" to="/admin/tokens/generate">
          Generate Token
        </Link>
      </div>
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Student</th>
              <th>Registration</th>
              <th>Status</th>
              <th>Usage</th>
              <th>Expires</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Loading tokens...</td>
              </tr>
            ) : filteredTokens.length ? (
              filteredTokens.map((token) => (
                <tr key={token.id}>
                  <td>{token.tokenCode}</td>
                  <td>{token.Student?.fullName || "—"}</td>
                  <td>{token.Student?.registrationNumber || "—"}</td>
                  <td>
                    <span className={`badge ${token.status?.toLowerCase()}`}>
                      {token.status}
                    </span>
                  </td>
                  <td>
                    {token.usageCount}/{token.maxUsage}
                  </td>
                  <td>{formatDate(token.expiresAt)}</td>
                  <td className="table-actions">
                    <Link className="link-button" to={`/admin/tokens/view/${token.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No tokens match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokensListPage;
