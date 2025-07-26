import { useEffect, useState } from "react";
import type { SearchResultDTO } from "../types/SearchResult";
import {
  fetchAllIncidents,
  searchIncidents,
  searchIncidentsBool,
} from "../api/search";

const Search = () => {
  const [results, setResults] = useState<SearchResultDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isBoolMode, setIsBoolMode] = useState(false);

  const [filters, setFilters] = useState({
    employeeName: "",
    incidentSeverity: "",
    organizationName: "",
    affectedOrganizationName: "",
    incidentDescription: "",
    address: "",
    distance: "",
    knn: false,
  });

  const [boolExpression, setBoolExpression] = useState<string>("");

  useEffect(() => {
    fetchAllIncidents()
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch incidents");
        setLoading(false);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;

    const name = target.name;
    const value = target.value;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFilters((prev) => ({
        ...prev,
        [name]: target.checked,
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let data: SearchResultDTO[];

      if (isBoolMode) {
        const tokens = parseBoolExpression(boolExpression);

        data = await searchIncidentsBool(tokens);
      } else {
        data = await searchIncidents(filters);
      }

      setResults(data);
    } catch (err) {
      console.error(err);
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const parseBoolExpression = (input: string): string[] => {
    const tokens: string[] = [];
    const parts = input.trim().split(/\s+/);

    const OPERATORS = new Set(["AND", "OR", "NOT"]);

    let i = 0;
    while (i < parts.length) {
      const part = parts[i];

      if (OPERATORS.has(part.toUpperCase())) {
        tokens.push(part.toUpperCase());
        i++;
      } else if (part.includes(":")) {
        const [field, firstValuePart] = part.split(":", 2);
        let valueParts = [firstValuePart];

        i++;
        while (
          i < parts.length &&
          !OPERATORS.has(parts[i].toUpperCase()) &&
          !parts[i].includes(":")
        ) {
          valueParts.push(parts[i]);
          i++;
        }

        const fullValue = valueParts.join(" ");

        const hasQuotes = fullValue.startsWith('"') && fullValue.endsWith('"');

        if (hasQuotes) {
          tokens.push(`${field}:${fullValue}`);
        } else {
          tokens.push(`${field}:${fullValue}`);
        }
      } else {
        tokens.push(part);
        i++;
      }
    }

    return tokens;
  };

  const highlightMatches = (
    text: string,
    highlights: string[]
  ): React.ReactNode => {
    if (!highlights || highlights.length === 0) return text;

    const escapedHighlights = highlights.map((h) =>
      h.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
    );
    const pattern = escapedHighlights.join("|");
    const regex = new RegExp(`(${pattern})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, idx) =>
      escapedHighlights.some((h) => new RegExp(`^${h}$`, "i").test(part)) ? (
        <mark key={idx} className="bg-yellow-300">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const extractEmphasizedWords = (highlightSnippets: string[]): string[] => {
    const matches: string[] = [];
    const emTagRegex = /<em>(.*?)<\/em>/gi;

    for (const snippet of highlightSnippets) {
      let match;
      while ((match = emTagRegex.exec(snippet)) !== null) {
        matches.push(match[1]);
      }
    }

    return [...new Set(matches)];
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Search Incidents</h1>

      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={isBoolMode}
            onChange={(e) => setIsBoolMode(e.target.checked)}
          />
          <span>Use Boolean Mode</span>
        </label>
      </div>

      <form
        onSubmit={handleSearch}
        className="space-y-2 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {isBoolMode ? (
          <textarea
            className="border p-2 rounded col-span-full"
            rows={4}
            placeholder={`e.g. name:Ivan NOT surname:Mrsulja OR surname:Popovic AND education:"PhD"`}
            value={boolExpression}
            onChange={(e) => setBoolExpression(e.target.value)}
          />
        ) : (
          <>
            <input
              name="employeeName"
              value={filters.employeeName}
              onChange={handleChange}
              placeholder="Employee Name"
              className="border p-2 rounded"
            />
            <input
              name="incidentSeverity"
              value={filters.incidentSeverity}
              onChange={handleChange}
              placeholder="Incident Severity"
              className="border p-2 rounded"
            />
            <input
              name="organizationName"
              value={filters.organizationName}
              onChange={handleChange}
              placeholder="Organization Name"
              className="border p-2 rounded"
            />
            <input
              name="affectedOrganizationName"
              value={filters.affectedOrganizationName}
              onChange={handleChange}
              placeholder="Affected Org Name"
              className="border p-2 rounded"
            />
            <input
              name="incidentDescription"
              value={filters.incidentDescription}
              onChange={handleChange}
              placeholder="Description"
              className="border p-2 rounded"
            />
            <input
              name="address"
              value={filters.address}
              onChange={handleChange}
              placeholder="Address"
              className="border p-2 rounded"
            />
            <input
              name="distance"
              value={filters.distance}
              onChange={handleChange}
              placeholder="Distance"
              className="border p-2 rounded"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="knn"
                checked={filters.knn}
                onChange={handleChange}
              />
              <span>Use KNN</span>
            </label>
          </>
        )}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded col-span-full"
        >
          Search
        </button>
      </form>

      {loading && <div>Loading incidents...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <ul className="space-y-4">
        {results.map((result, index) => (
          <li
            key={result.index.id || index}
            className="border rounded p-4 shadow-sm"
          >
            <p>
              <strong>Employee:</strong> {result.index.employeeName}
            </p>
            <p>
              <strong>Organization:</strong> {result.index.organizationName}
            </p>
            <p>
              <strong>Affected Org:</strong>{" "}
              {result.index.affectedOrganizationName}
            </p>
            <p>
              <strong>Severity:</strong> {result.index.incidentSeverity}
            </p>
            {result.index.incidentDescriptionSr && (
              <p>
                <strong>Description (SR):</strong>{" "}
                {result.index.incidentDescriptionSr}
              </p>
            )}
            {result.index.incidentDescriptionEn && (
              <p>
                <strong>Description (EN):</strong>{" "}
                {highlightMatches(
                  result.index.incidentDescriptionEn,
                  extractEmphasizedWords(
                    result.highlights["incidentDescriptionEn"] || []
                  )
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
