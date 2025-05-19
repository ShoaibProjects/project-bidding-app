import { uploadDeliverable } from "../services/projectService";
import { useState } from "react";

const UploadDeliverable = ({ projectId, toRefresh, setToRefresh }: { projectId: string;  toRefresh: boolean; setToRefresh?: React.Dispatch<React.SetStateAction<boolean>>; }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!file) return alert("Please upload a file first");

    try {
      await uploadDeliverable(projectId, file);
      alert("Deliverable uploaded and buyer notified!");
      setToRefresh?.(!toRefresh);
    } catch (err) {
      console.error(err);
      alert("Failed to upload deliverable");
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
          }
        }}
        className="border p-2"
      />
      <button onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 mt-2">
        Submit Deliverable
      </button>
    </div>
  );
};

export default UploadDeliverable;
