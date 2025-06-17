import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { useAnnouncementStore } from '../../store/announcement.store';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getDecodedToken } from '../../utils/authUtils';

const initialValue = {
  id: "",
  title: "",
  description: "",
  number: 0,
};

const commonFields = [
  { name: "title", type: "text", label: "Title" },
  { name: "number", type: 'text', inputType: 'number', label: 'Number' },
  { name: "description", type: "richtext", label: "Description" },
];

enum ANNOUNCEMENT_STATUS {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED"
}

const additionalFields = [
  {
    name: "status",
    type: "select",
    label: "Status",
    options: Object.values(ANNOUNCEMENT_STATUS).map(status => ({ value: status, label: status }))
  },
  { name: "createdAt", type: "date", label: "Created Date", disabled: true },
  { name: "updatedAt", type: "date", label: "Updated Date", disabled: true },
  { name: "id", type: "text", label: "ID", disabled: true }
];

export default function Announcement() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('title');
  const { showPopup } = usePopup();

  const {
    announcements,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createAnnouncement,
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAnnouncements,
  } = useAnnouncementStore();

  const user = getDecodedToken();

  const header = useMemo(
    () => [
      { label: 'Title', key: 'title' },
      { label: 'Number', key: 'number' },
      { label: 'Status', key: 'status' },
      { label: 'Created Date', key: 'createdAt' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredAnnouncements = useCallback(async () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    if (searchTerm) filters[searchField] = searchTerm;

    try {
      await fetchAnnouncements(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [statusFilter, searchTerm, searchField, currentPage, limit, fetchAnnouncements, showPopup]);

  useEffect(() => {
    fetchFilteredAnnouncements();
  }, [limit, currentPage]);


  const handleSearch = useCallback(() => {
    fetchFilteredAnnouncements();
  }, [fetchFilteredAnnouncements]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = async (id?: string) => {
    const data = id ? await getAnnouncementById(id) : initialValue;
    console.log('Fetched data:', data); // Add this line
    setFormData(data);
    setOpen(true);
  };


  const handleFormClose = () => {
    setOpen(false);
    setFormData(initialValue);
  };

  const onFormChange = (e: any) => {
    const { name, value } = e.target;
    if (name) {
      setFormData({ ...formData, [name]: value });
    } else {
      console.warn('onFormChange: name is undefined', e);
    }
  };



  const handleFormSubmit = async () => {
    try {
      if (formData.id) {
        const { title, description, status, number } = formData;
        const data = await updateAnnouncement(formData.id, { title, description, status, number });
        showPopup(data.message, 'success');
      } else {
        delete formData.id;
        const data = await createAnnouncement(formData);
        showPopup(data.message, 'success');
      }
      fetchFilteredAnnouncements();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this announcement?");
    if (!isConfirmed) return;

    try {
      const data = await deleteAnnouncement(id);
      showPopup(data.message, 'success');
      fetchFilteredAnnouncements();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const actions = [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteAnnouncement,
      tooltip: 'Delete',
      condition: (row) => row.publisherId === user.userId,
    },
  ];

  const fields = formData.id ? [...commonFields, ...additionalFields] : commonFields;

  return (
    <Layout title="Announcement">
      <div>
        <div className="flex justify-between my-4">
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">Status</option>
              {Object.values(ANNOUNCEMENT_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="title">Title</option>
              <option value="number">Number</option>
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
            Create
          </button>
        </div>

        <TailwindTable header={header} data={announcements} actions={actions} />

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
