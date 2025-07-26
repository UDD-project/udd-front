import { useState } from "react";
import { uploadFile } from "../api/parse";
import { indexParsedDocument } from "../api/index";
import type { ParsedDocument } from "../types/ParsedDocument";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedDocument | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadFile(file);
      setParsed(result);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading file.");
    }
  };

  const handleConfirm = async () => {
    if (!parsed) return;
    try {
      await indexParsedDocument(parsed);
      setMessage("Document successfully indexed.");
      setParsed(null);
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Indexing failed.");
    }
  };

  const handleCancel = () => {
    setParsed(null);
    setFile(null);
    setMessage("Indexing canceled.");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!parsed) return;
    const { name, value } = e.target;
    setParsed({ ...parsed, [name]: value });
  };

  return (
    <div>
      <h2>Upload Incident PDF</h2>

      {!parsed && (
        <>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          <button onClick={handleUpload} disabled={!file}>
            Upload
          </button>
        </>
      )}

      {parsed && (
        <form>
          <label>
            Filename:
            <input
              name="filename"
              value={parsed.filename}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Employee Name:
            <input
              name="employeeName"
              value={parsed.employeeName}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Organization Name:
            <input
              name="organizationName"
              value={parsed.organizationName}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Affected Organization:
            <input
              name="affectedOrganizationName"
              value={parsed.affectedOrganizationName}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Severity:
            <input
              name="incidentSeverity"
              value={parsed.incidentSeverity}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Address:
            <input
              name="address"
              value={parsed.address}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Description:
            <textarea
              name="incidentDescription"
              value={parsed.incidentDescription}
              onChange={handleChange}
            />
          </label>
          <br />
          <button type="button" onClick={handleConfirm}>
            Confirm Index
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default Upload;
