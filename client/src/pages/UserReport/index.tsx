import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { useUserReportStore } from '../../store/user-report.store';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDecodedToken, localUserData } from '../../utils/authUtils';

const initialValue = {
  id: "",
  description: "",
  startDate: "",
  endDate: "",
};

const commonFields = [
  { name: "startDate", type: "date", label: "Start Date" },
  { name: "endDate", type: "date", label: "End Date" },
  { name: "description", type: "richtext", label: "Description" },
];

const additionalFields = [
  { name: "reportedAt", type: "date", label: "Reported At", disabled: true },
  { name: "id", type: "text", label: "Report ID", disabled: true },
  { name: "userId", type: "text", label: "User ID", disabled: true },
];

export default function UserReport() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('userId');
  const { showPopup } = usePopup();
  const user = getDecodedToken();
  const userData = localUserData();

  const {
    userReports,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createUserReport,
    getUserReportById,
    updateUserReport,
    deleteUserReport,
    fetchUserReports,
  } = useUserReportStore();

  const header = useMemo(() => [
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
    { label: 'Reported At', key: 'reportedAt' },
  ], []);

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredReports = useCallback(async () => {
    const filters: any = {};
    if (searchTerm) filters[searchField] = searchTerm;

    try {
      await fetchUserReports(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [searchTerm, searchField, currentPage, limit, fetchUserReports, showPopup]);

  useEffect(() => {
    fetchFilteredReports();
  }, [limit, currentPage]);

  const handleSearch = useCallback(() => {
    fetchFilteredReports();
  }, [fetchFilteredReports]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = async (id?: string) => {
    const data = id ? await getUserReportById(id) : initialValue;
    setFormData(data);
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
    setFormData(initialValue);
  };

  const onFormChange = (e: any) => {
    if (e.target) {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, description: e });
    }
  };

  const handleRichTextChange = (value: string) => {
    setFormData({ ...formData, description: value });
  };

  const handleFormSubmit = async () => {
    try {
      if (formData.id) {
        if (user.userId !== formData.userId) {
          showPopup("You don't have permission to perform this action", 'error');
          handleFormClose();
          return;
        }
        const { description, startDate, endDate } = formData;
        const data = await updateUserReport(formData.id, { description, startDate, endDate });
        showPopup(data.message, 'success');
      } else {
        delete formData.id;
        const data = await createUserReport(formData);
        showPopup(data.message, 'success');
      }
      fetchFilteredReports();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const handleDeleteReport = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this report?");
    if (!isConfirmed) return;

    try {
      const data = await deleteUserReport(id);
      showPopup(data.message, 'success');
      fetchFilteredReports();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const actions = [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit Report',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteReport,
      tooltip: 'Delete Report',
      condition: (row) => user.role !== 'HEAD'
    },
  ];

  const fields = formData.id ? [...commonFields, ...additionalFields] : commonFields;

  return (
    <Layout title="User Report System">
      <div>
        <div className="flex justify-between my-4">
          <div className="flex space-x-4">
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="userId">User ID</option>
            </select>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            />
            <button
              onClick={handleSearch}
              className="bg-main-black text-white py-2 px-4 rounded-lg font-bold"
            >
              Search
            </button>
          </div>
          <button
            className="bg-main-black text-white py-2 px-4 rounded-lg font-bold"
            onClick={() => handleFormOpen()}
          >
            Submit New Report
          </button>
        </div>

        <TailwindTable header={header} data={userReports} actions={actions} />

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
          setData={setFormData}
          handleFormSubmit={handleFormSubmit}
          fields={fields}
        />
      </div>
    </Layout>
  );
}
