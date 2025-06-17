import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { useFeedbackStore } from '../../store/feedback.store';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { getDecodedToken } from '../../utils/authUtils';

const initialValue = {
  id: "",
  fullName: "",
  phone: "",
  email: "",
  message: "",
  comment: "",
};

const commonFields = [
  { name: "fullName", type: "text", label: "Full Name" },
  { name: "email", type: "text", inputType: "email", label: "Email" },
  { name: "phone", type: "text", inputType: "tel", label: "Phone Number" },
  { name: "comment", type: "richtext", label: "Comment" },
];

enum FEEDBACK_STATUS {
  PENDING = "PENDING",
  RESOLVED = "RESOLVED",
  ARCHIVED = "ARCHIVED"
}

const additionalFields = [
  {
    name: "status",
    type: "select",
    label: "Status",
    options: Object.values(FEEDBACK_STATUS).map(status => ({ value: status, label: status }))
  },
  { name: "feedbackDate", type: "date", label: "Feedback Date", disabled: true },
  { name: "id", type: "text", label: "Feedback ID", disabled: true },
];

export default function Feedback() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [statusFilter, setStatusFilter] = useState('');
  const { showPopup } = usePopup();
  const user = getDecodedToken();

  const {
    feedbacks,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createFeedback,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
    fetchFeedbacks,
  } = useFeedbackStore();

  const header = useMemo(
    () => [
      { label: 'Full Name', key: 'fullName' },
      { label: 'Phone Number', key: 'phone' },
      { label: 'Status', key: 'status' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredFeedbacks = useCallback(async () => {
    const filters: any = {};
    if (statusFilter) filters.status = statusFilter;
    try {
      await fetchFeedbacks(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [statusFilter, fetchFeedbacks, currentPage, limit, showPopup]);

  useEffect(() => {
    fetchFilteredFeedbacks();
  }, [fetchFilteredFeedbacks]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = async (id?: string) => {
    setFormData(id ? await getFeedbackById(id) : initialValue);
    setOpen(true);
  };

  const handleFormClose = () => {
    setOpen(false);
    setFormData(initialValue);
  };

  const onFormChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async () => {
    try {
      if (formData.id) {
        const { status } = formData;
        const data = await updateFeedback(formData.id, { status });
        showPopup(data.message, 'success');
      } else {
        delete formData.id;
        const data = await createFeedback(formData);
        showPopup(data.message, 'success');
      }
      await fetchFilteredFeedbacks();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this feedback?");
    if (!isConfirmed) return;

    try {
      const data = await deleteFeedback(id);
      showPopup(data.message, 'success');
      fetchFilteredFeedbacks();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  };

  const actions = useMemo(() => [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit Feedback',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteFeedback,
      tooltip: 'Delete Feedback',
      condition: (row) => user.role === 'HEAD'
    },
  ], [handleFormOpen, handleDeleteFeedback]);

  const fields = formData.id ? [...commonFields, ...additionalFields] : commonFields;

  return (
    <Layout title="Feedback Management">
      <div>
        <div className="flex justify-between my-4">
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg bg-main-white"
            >
              <option value="">Feedback Status</option>
              {Object.values(FEEDBACK_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <TailwindTable header={header} data={feedbacks} actions={actions} />

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
