import { useState, useCallback, useMemo, useEffect } from "preact/hooks";
import Layout from "../../components/Layout";
import PaginationMega from "../../components/PaginationMega";
import TailwindTable from "../../components/Tailwind-Table";
import FormDialog from "../../components/form-dialog";
import { usePopup } from "../../components/popup/context";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { BiTransferAlt } from "react-icons/bi";
import { useLandStore } from "../../store/land.store";
import { getDecodedToken, localUserData } from "../../utils/authUtils";
import { useOfficeStore } from "../../store/office.store";
import axiosInstance from "../../axiosInstance";

const initialValue = {
  id: "",
  name: "",
  area: 0,
  wereda: "",
  subcity: "",
  landOwnerId: "",
};

enum LAND_TYPE {
  LEASE = "LEASE",
  PURCHASED = "PURCHASED",
  DONATED = "DONATED",
  INHERITED = "INHERITED",
  AGRICULTURAL = "AGRICULTURAL",
  COMMERCIAL = "COMMERCIAL",
  RESIDENTIAL = "RESIDENTIAL",
  INDUSTRIAL = "INDUSTRIAL",
  PUBLIC = "PUBLIC",
  CONSERVATION = "CONSERVATION",
  RECREATIONAL = "RECREATIONAL",
  EDUCATIONAL = "EDUCATIONAL",
  MEDICAL = "MEDICAL",
  RELIGIOUS = "RELIGIOUS",
  MILITARY = "MILITARY",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  MIXED_USE = "MIXED_USE",
  UNDEVELOPED = "UNDEVELOPED",
  FORESTRY = "FORESTRY",
  WATER_RESOURCE = "WATER_RESOURCE",
  CULTURAL = "CULTURAL",
  HISTORICAL = "HISTORICAL",
  NOT_ASSIGNED = "NOT_ASSIGNED"
}

enum LAND_STATUS {
  VACANT = "VACANT",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  DEVELOPED = "DEVELOPED",
  OCCUPIED = "OCCUPIED",
  LEASED = "LEASED",
  FOR_SALE = "FOR_SALE",
  RESTRICTED = "RESTRICTED",
  DISPUTED = "DISPUTED",
  ABANDONED = "ABANDONED",
  INACTIVE = "INACTIVE",
  DAMAGED = "DAMAGED",
  PENDING_DEVELOPMENT = "PENDING_DEVELOPMENT",
  RESERVED = "RESERVED",
  UNDER_RENOVATION = "UNDER_RENOVATION",
  FOR_RENT = "FOR_RENT",
  NOT_AVAILABLE = "NOT_AVAILABLE",
  HAZARDOUS = "HAZARDOUS",
  ENVIRONMENTALLY_SENSITIVE = "ENVIRONMENTALLY_SENSITIVE",
  CONTAMINATED = "CONTAMINATED",
  PROTECTED = "PROTECTED",
  TEMPORARILY_UNAVAILABLE = "TEMPORARILY_UNAVAILABLE",
  PERMANENTLY_UNAVAILABLE = "PERMANENTLY_UNAVAILABLE",
  NOT_ASSIGNED = "NOT_ASSIGNED"
}

const LandManagement = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const { showPopup } = usePopup();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [newLandOwnerId, setNewLandOwnerId] = useState("");
  const [transferLandId, setTransferLandId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [officeId, setOfficeId] = useState<string>("");
  const { fetchOffices, offices } = useOfficeStore();
  const [landReport, setLandReport] = useState([]);

  const {
    lands,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    fetchLands,
    getLandById,
    createLand,
    updateLand,
    deleteLand,
    transferLand,
  } = useLandStore();

  const header = useMemo(() => [
    { label: "Place name", key: "name" },
    { label: "Land Area", key: "area" },
    { label: "Wereda", key: "wereda" },
    { label: "Detail", key: "id", render: (row) => <a href={`/land/${row.id}`} className="text-blue-600 underline">View Detail</a> },
  ], []);

  const user = getDecodedToken();
  const userData = localUserData();

  let commonFields = [
    { label: "Land Owner ID", type: 'text', name: "landOwnerId", required: true },
    { name: "name", type: "text", label: "Place Name" },
    { name: "area", type: "text", inputType: "decimal", label: "Area" },
    { name: "wereda", type: "text", label: "Wereda" },
    { name: "type", type: "select", label: "Land Type", options: Object.values(LAND_TYPE).map(type => ({ value: type, label: type })) },
    { name: "absoluteLocation", type: "text", label: "Absolute Location" },
    { name: "mapUrl", type: "text", label: "Map Link" },
  ];

  commonFields = user.role === "LAND_BANK" ? commonFields.slice(1) : commonFields;
  if (user.role === 'LAND_BANK') {
    delete initialValue.landOwnerId;
  }

  const additionalFields = [
    { name: "registrationNo", type: "text", label: "Registration No." },
    { name: "certificationNo", type: "text", label: "Certificate No." },
    { name: "landStatus", type: "select", label: "Land Status", options: Object.values(LAND_STATUS).map(status => ({ value: status, label: status })) },
    { name: "grade", type: "text", inputType: "decimal", label: "Grade" },
    { name: "parcelId", type: "text", label: "Parcel ID" },
    { name: "comment", type: "richtext", label: "Comment" },
    { name: "marketValue", type: "text", inputType: "decimal", label: "Market Value" },
    { name: "encumbrances", type: "richtext", label: "Encumbrances" },
    { name: "createdAt", type: "date", label: "Created At", disabled: true },
    { name: "updatedAt", type: "date", label: "Updated At", disabled: true },
    { name: "registeredBy", type: "text", label: "Registered By", disabled: true },
  ];

  const fetchLandsWithFilters = useCallback(async () => {
    const filters: any = {};
    if (typeFilter) filters.type = typeFilter;
    if (statusFilter) filters.landStatus = statusFilter;
    if (searchField) filters[searchField] = searchTerm;
    if (officeId) filters.officeId = officeId;
    try {
      await fetchLands(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, "error");
    }
  }, [typeFilter, statusFilter, searchTerm, searchField, fetchLands, currentPage, limit, showPopup, officeId]);

  useEffect(() => {
    fetchLandsWithFilters();
    if (offices.length === 0) {
      fetchOffices();
    }
  }, [fetchLandsWithFilters]);

  const reportFilters = useMemo(() => {
    const filters: Record<string, any> = {};
    if (typeFilter) filters.type = typeFilter;
    if (statusFilter) filters.landStatus = statusFilter;
    if (officeId) filters.officeId = officeId;
    return filters;
  }, [typeFilter, statusFilter, officeId]);

  const fetchLandReport = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(reportFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value as string);
      });
      const response = await axiosInstance.get(`/land/all?${queryParams.toString()}`);
      setLandReport(response.data.data);
    } catch (error) {
      showPopup(error.message, "error");
    }
  }, [axiosInstance, reportFilters, showPopup]);

  useEffect(() => {
    fetchLandReport();
  }, [fetchLandReport]);

  const handlePageChange = useCallback((pageIndex: number) => setCurrentPage(pageIndex), [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = useCallback(async (id: string) => {
    const land = await getLandById(id);
    if (land) {
      setFormData(land);
      setOpen(true);
    }
  }, [getLandById]);

  const handleFormClose = useCallback(() => {
    setFormData(initialValue);
    setOpen(false);
  }, []);

  const onFormChange = useCallback((e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFormSubmit = useCallback(async () => {
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) =>
        value !== "" && value !== 0 && value !== null && !["id", "officeId", "createdAt", "updatedAt", "registeredBy", "landOwner", "landTransferHistory", "landFiles"].includes(key)
      )
    );
    try {
      if (formData.id) {
        if (formData.landOwnerId !== null) {
          showPopup("You don't have permission to perform this action", 'error');
          handleFormClose();
          return;
        }
        await updateLand(formData.id, filteredData);
        showPopup("Land updated successfully", "success");
      } else {
        await createLand(filteredData);
        showPopup("Land created successfully", "success");
      }
      fetchLandsWithFilters();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, "error");
    }
  }, [formData, updateLand, createLand, fetchLandsWithFilters, handleFormClose, showPopup]);

  const handleDeleteLand = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this land?")) {
      try {
        await deleteLand(id);
        showPopup("Land deleted successfully", "success");
      } catch (err: any) {
        showPopup(err.message, "error");
      }
    }
  }, [deleteLand, showPopup]);

  const openTransferModal = useCallback((landId: string) => {
    setTransferLandId(landId);
    setTransferModalOpen(true);
  }, []);

  const confirmLandTransfer = useCallback(async () => {
    if (!newLandOwnerId) {
      showPopup("Please provide a valid new land owner ID.", "error");
      return;
    }
    if (window.confirm("This action will be recorded. Proceed?")) {
      try {
        await transferLand({ landId: transferLandId, newLandOwnerId });
        showPopup("Land transferred successfully", "success");
        fetchLandsWithFilters();
        setTransferModalOpen(false);
        setNewLandOwnerId("");
      } catch (err: any) {
        showPopup(err.message, "error");
      }
    }
  }, [newLandOwnerId, transferLand, transferLandId, fetchLandsWithFilters, showPopup]);

  const actions = useMemo(() => [
    {
      type: "edit",
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: "Edit Land",
      condition: (row) => user?.role === "SYSTEM_ADMIN" || (user?.role === "LAND_BANK" && userData.officeId !== null),
    },
    {
      type: "delete",
      icon: <MdDelete />,
      handler: handleDeleteLand,
      tooltip: "Delete Land",
      condition: (row) => user?.role === "SYSTEM_ADMIN" || (user?.role === "LAND_BANK" && userData.officeId !== null),
    },
    {
      type: "transfer",
      icon: <BiTransferAlt />,
      handler: openTransferModal,
      tooltip: "Transfer Land",
      condition: (row) => user?.role === "SYSTEM_ADMIN",
    },
  ], [handleFormOpen, handleDeleteLand, openTransferModal]);

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);
  const fields = useMemo(() => (formData.id && user.role !== "LAND_BANK" ? [...commonFields, ...additionalFields] : commonFields), [formData.id]);

  const { totalAreaByType, totalOwnedArea } = useMemo(() => {
    const totals = { totalAreaByType: {}, totalOwnedArea: 0 };
    landReport.forEach(land => {
      if (land.landOwnerId !== null) {
        totals.totalAreaByType[land.type] = (totals.totalAreaByType[land.type] || 0) + parseFloat(land.area);
        totals.totalOwnedArea += parseFloat(land.area);
      }
    });
    return totals;
  }, [landReport]);

  const { landBankAreaByType, totalLandBankArea } = useMemo(() => {
    const totals = { landBankAreaByType: {}, totalLandBankArea: 0 };
    landReport.forEach(land => {
      if (land.landOwnerId === null) {
        totals.landBankAreaByType[land.type] = (totals.landBankAreaByType[land.type] || 0) + parseFloat(land.area);
        totals.totalLandBankArea += parseFloat(land.area);
      }
    });
    return totals;
  }, [landReport]);

  return (
    <Layout title="Land Management System">
      <div>
        <div className="flex justify-between my-4 items-center">
          <div className="flex space-x-4">
            {userData.officeId === null && (
              <select
                value={officeId}
                onChange={(e: any) => setOfficeId(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
              >
                <option value="">Select Office</option>
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.name}
                  </option>
                ))}
              </select>
            )}
            <select
              value={typeFilter}
              onChange={(e: any) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-main-white"
            >
              <option value="">Land Type</option>
              {Object.values(LAND_TYPE).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-main-white"
            >
              <option value="">Land Status</option>
              {Object.values(LAND_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {(userData.officeId !== null && ['SYSTEM_ADMIN', 'LAND_BANK'].includes(user.role)) && (
            <button onClick={() => setOpen(true)} className="bg-main-black text-white py-2 px-4 rounded-lg font-bold">
              Register New Land
            </button>
          )}
        </div>

        <div className="flex justify-between">
          <div className="flex space-x-4">
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-main-white"
            >
              {userData.officeId !== null && <option value="landOwnerId">Land Owner ID</option>}
              <option value="name">Name</option>
              <option value="registrationNo">Registration No.</option>
              <option value="certificationNo">Certificate No.</option>
            </select>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-main-white"
            />
            <button
              onClick={fetchLandsWithFilters}
              className="bg-main-black text-white py-2 px-4 rounded-lg font-bold"
            >
              Search
            </button>
          </div>
        </div>

        <TailwindTable header={header} data={lands} actions={actions} />

        <PaginationMega
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={limit}
          setLimit={handleLimitChange}
        />

        <FormDialog
          open={open}
          handleClose={handleFormClose}
          data={formData}
          onChange={onFormChange}
          handleFormSubmit={handleFormSubmit}
          fields={fields}
        />

        {transferModalOpen && (
          <FormDialog
            open={transferModalOpen}
            handleClose={() => setTransferModalOpen(false)}
            data={{ newLandOwnerId }}
            onChange={(e: any) => setNewLandOwnerId(e.target.value)}
            handleFormSubmit={confirmLandTransfer}
            fields={[
              { name: "newLandOwnerId", type: "text", label: "New Land Owner ID" },
            ]}
          />
        )}

        {(user.role === "LAND_BANK" || user.role === "HEAD") && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-2">Total Land Area by Type (Owned by Individuals)</h2>
              <ul className="list-disc ml-6">
                {Object.entries(totalAreaByType).map(([type, area]) => (
                  <li key={type}>
                    {type}: {area} sq.m
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-semibold">Total Owned Area: {totalOwnedArea} sq.m</p>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-2">Total Land Area by Type (Managed by Land Bank)</h2>
              <ul className="list-disc ml-6">
                {Object.entries(landBankAreaByType).map(([type, area]) => (
                  <li key={type}>
                    {type}: {area} sq.m
                  </li>
                ))}
              </ul>
              <p className="mt-2 font-semibold">Total Land Bank Area: {totalLandBankArea} sq.m</p>
            </div>
          </div>
        )}
      </div>
    </Layout>

  );
};

export default LandManagement;
