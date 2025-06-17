import { useState, useEffect, useCallback } from "preact/hooks";
import { FaFileUpload } from "react-icons/fa";
import { BiTransferAlt } from "react-icons/bi";
import { useLandStore } from "../../../store/land.store";
import { usePopup } from "../../../components/popup/context";
import Layout from "../../../components/Layout";
import CustomFileInput from "../../../components/form-dialog/CustomFileInputx";
import { getDecodedToken } from "../../../utils/authUtils";

const LandDetails: React.FC<any> = () => {
  const landId = window.location.pathname.split("/").pop();
  const { getLandById, transferLand, attachFiles, deleteFile } = useLandStore();
  const { showPopup } = usePopup();
  const user = getDecodedToken();

  const [land, setLand] = useState<any>(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [newLandOwnerId, setNewLandOwnerId] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const fetchLandDetails = useCallback(async () => {
    try {
      const landDetails = await getLandById(landId);
      setLand(landDetails);
    } catch (error) {
      showPopup("Failed to fetch land details.", "error");
    }
  }, [landId, getLandById, showPopup]);

  useEffect(() => {
    fetchLandDetails();
  }, [fetchLandDetails]);

  const handleFileUpload = async () => {
    if (!filesToUpload.length) {
      showPopup("Please select at least one file to upload.", "error");
      return;
    }

    try {
      await attachFiles(landId, filesToUpload);
      showPopup("Files uploaded successfully", "success");
      fetchLandDetails();
      setFilesToUpload([]);
    } catch (err) {
      showPopup("Failed to upload files.", "error");
    }
  };

  const handleDeleteFile = useCallback(async (fileId: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this file?");
    if (!isConfirmed) return;

    try {
      await deleteFile(fileId);
      showPopup("File deleted successfully", "success");
      fetchLandDetails();
    } catch (error) {
      showPopup("Failed to delete file", "error");
    }
  }, [deleteFile, showPopup, fetchLandDetails]);

  return (
    <Layout title={`Land: ${land?.name || "Loading..."}`}>
      {land && (
        <div className="p-6 bg-white rounded-lg shadow-md max-w-3xl mx-auto space-y-8 md:space-y-10">
          {/* Land Information */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Land Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p><strong>Land Name:</strong> {land.name}</p>
              <p><strong>Land Owner:</strong> {land.landOwner?.firstName} {land.landOwner?.middleName} {land.landOwner?.lastName}</p>
              <p><strong>Land Type:</strong> {land.type}</p>
              <p><strong>Land Status:</strong> {land.landStatus}</p>
              <p><strong>Area:</strong> {land.area} sq. meters</p>
              <p><strong>Grade:</strong> {land.grade}</p>
              <p><strong>Registration No:</strong> {land.registrationNo}</p>
              <p><strong>Parcel ID:</strong> {land.parcelId}</p>
              <p><strong>Certificate No:</strong> {land.certificationNo}</p>
              <p><strong>Location:</strong> {land.absoluteLocation || "N/A"}</p>
              <p><strong>Map View:</strong> <a href={land.mapUrl} className="text-blue-600 underline" target="_blank">View on Map</a></p>
              <p><strong>Encumbrances:</strong> {land.encumbrances || "None"}</p>
              <p><strong>Market Value:</strong> {land.marketValue ? `${land.marketValue} ETB` : "N/A"}</p>
            </div>
          </div>

          {/* Transfer History */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800">Land Transfer History</h3>
            <ul className="space-y-2 mt-2">
              {land.landTransferHistory.map((transfer: any) => {
                const { firstName, middleName, lastName } = transfer.landOwner;
                return (
                  <li key={transfer.id}>
                    This land was transferred to <strong>{firstName} {middleName} {lastName}</strong> on <strong>{new Date(transfer.transferDate).toLocaleDateString()}</strong>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Attached Files */}
          <div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Attached Files</h3>
              <ul className="space-y-2 mt-2">
                {land.landFiles.map((file: any) => (
                  <li key={file.id} className="flex justify-between items-center">
                    <span>{file.fileName}</span>
                    <div className="flex gap-4">
                      <a href={`/${file.filePath}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        View
                      </a>
                      <a href={file.fileUrl} download={file.fileName} className="text-green-600 underline">
                        Download
                      </a>
                      <button onClick={() => handleDeleteFile(file.id)} className="text-red-600 underline">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {
              user.role === "SYSTEM_ADMIN" && <div>
                <h3 className="text-xl font-semibold text-gray-800 mt-8">Upload Files</h3>
                <CustomFileInput
                  id="file-upload"
                  name="files"
                  onChange={(e: any) => setFilesToUpload(Array.from(e.target.files))}
                />
                <button
                  onClick={handleFileUpload}
                  className="bg-main-black text-white py-2 px-4 rounded-lg mt-4 flex items-center space-x-2"
                >
                  <FaFileUpload /> <span>Upload</span>
                </button>
              </div>
            }
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LandDetails;
