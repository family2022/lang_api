import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../../components/Layout';
import PaginationMega from '../../../components/PaginationMega';
import TailwindTable from '../../../components/Tailwind-Table';
import FormDialog from '../../../components/form-dialog';
import { usePopup } from '../../../components/popup/context';
import { useLandOwnerStore } from '../../../store/landOwner.store';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { getDecodedToken, localUserData } from '../../../utils/authUtils';

const initialValue = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  nationalId: null,
};

const commonFields = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "middleName", type: "text", label: "Father's Name" },
  { name: "lastName", type: "text", label: "Grandfather's Name" },
  { name: "gender", type: "select", label: "Gender", options: [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }] },
  { name: "phone", type: "text", inputType: "tel", label: "Phone" },
  { name: "email", type: "text", inputType: "email", label: "Email" },
  { name: 'nationalId', type: 'file', label: 'National ID', single: true }
];

const additionalFields = [
  { name: "updatedAt", type: "date", label: "Last Updated", disabled: true },
  { name: "createdAt", type: "date", label: "Registered At", disabled: true },
  { name: "id", type: "text", label: "Land Owner ID", disabled: true }
];

export default function LandOwner() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("name");
  const [genderFilter, setGenderFilter] = useState("");
  const { showPopup } = usePopup();
  const user = getDecodedToken();
  const userData = localUserData();

  const {
    landOwners,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createLandOwner,
    getLandOwnerById,
    updateLandOwner,
    deleteLandOwner,
    fetchLandOwners,
  } = useLandOwnerStore();

  const header = useMemo(
    () => [
      { label: 'First Name', key: 'firstName' },
      { label: "Father's Name", key: 'middleName' },
      { label: "Grandfather's Name", key: 'lastName' },
      { label: "National ID", key: "nationalIdUrl", render: (row) => <>{row.nationalIdUrl && <a href={row.nationalIdUrl} target="_blank" className="text-blue-600 underline">View ID</a>}</> },
      { label: 'Phone', key: 'phone' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  useEffect(() => {
    fetchLandOwners(currentPage, limit);
  }, [fetchLandOwners, currentPage, limit, genderFilter]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = useCallback(async (id?: string) => {
    setFormData(id ? await getLandOwnerById(id) : initialValue);
    setOpen(true);
  }, [getLandOwnerById]);

  const handleFormClose = useCallback(() => {
    setOpen(false);
    setFormData(initialValue);
  }, []);

  const onFormChange = useCallback((e: any) => {
    const { name, value, files } = e.target;
    if (name === 'nationalId' && files) {
      setFormData(prevFormData => ({ ...prevFormData, [name]: files[0] }));
    } else {
      setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }
  }, []);

  const handleFormSubmit = useCallback(async () => {
    try {
      if (user.role !== 'SYSTEM_ADMIN' || userData.officeId === null) {
        showPopup("You don't have permission to perform this action", 'error');
        handleFormClose();
        return;
      }

      formData.email = formData.email?.trim() || undefined;

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value as string | Blob);
        }
      });

      const data = formData.id
        ? await updateLandOwner(formData.id, formDataToSend)
        : await createLandOwner(formDataToSend);

      showPopup(data.message, 'success');
      await fetchLandOwners(currentPage, limit);
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  }, [formData, createLandOwner, updateLandOwner, fetchLandOwners, currentPage, limit, showPopup, handleFormClose]);

  const handleDeleteLandOwner = useCallback(async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this land owner?");
    if (!isConfirmed) return;

    try {
      const data = await deleteLandOwner(id);
      fetchLandOwners(currentPage, limit);
      showPopup(data.message, 'success');
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  }, [deleteLandOwner, fetchLandOwners, currentPage, limit, showPopup]);

  const handleSearch = useCallback(async () => {
    const searchParams: any = {};
    if (searchQuery) {
      if (searchField === "name") {
        const [firstName, middleName, lastName] = searchQuery.split(" ");
        if (firstName) searchParams.firstName = firstName;
        if (middleName) searchParams.middleName = middleName;
        if (lastName) searchParams.lastName = lastName;
      } else {
        searchParams[searchField] = searchQuery;
      }
    }
    if (genderFilter) {
      searchParams.gender = genderFilter;
    }
    try {
      await fetchLandOwners(currentPage, limit, searchParams);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [searchQuery, searchField, genderFilter, fetchLandOwners, currentPage, limit, showPopup]);

  const actions = useMemo(() => [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit Land Owner',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteLandOwner,
      tooltip: 'Delete Land Owner',
      condition: (row) => user.role === 'SYSTEM_ADMIN' && userData.officeId !== null,
    },
  ], [handleFormOpen, handleDeleteLandOwner]);

  const fields = useMemo(() => (formData.id ? [...commonFields, ...additionalFields] : commonFields), [formData.id]);

  return (
    <Layout title="Land Owner Management">
      <div>
        <div className="flex justify-between items-center my-4">
          <div className="flex space-x-4 mb-4">
            <select
              name="genderFilter"
              value={genderFilter}
              onChange={(e: any) => setGenderFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none focus:border-main-orange bg-main-white"
            >
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>

            <select
              name="searchField"
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg outline-none focus:border-main-orange bg-main-white"
            >
              <option value="name">Name</option>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
            </select>

            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e: any) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg outline-none focus:border-main-orange bg-main-white"
            />

            <button
              onClick={handleSearch}
              className="bg-main-black text-main-white py-2 px-4 rounded-lg font-bold"
            >
              Search
            </button>
          </div>

          {(userData.officeId !== null && ['SYSTEM_ADMIN', 'LAND_BANK'].includes(user.role)) && (
            <button
              className="bg-main-black text-main-white py-2 px-4 rounded-lg font-bold"
              onClick={() => handleFormOpen()}
            >
              Register Land Owner
            </button>
          )}
        </div>

        <TailwindTable header={header} data={landOwners} actions={actions} />

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
      </div>
    </Layout>
  );
}
