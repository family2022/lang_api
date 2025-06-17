import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { useAppointmentStore } from '../../store/appointment.store';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ImCheckboxChecked } from 'react-icons/im';
import { IoMdDoneAll } from 'react-icons/io';
import { FcCancel } from 'react-icons/fc';
import { getDecodedToken, localUserData } from '../../utils/authUtils';

const initialValue = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  phone: "",
  email: "",
  reason: "",
};

const commonFields = [
  { name: "rejectionReason", type: "richtext", label: "Rejection Reason" },
  { name: "reason", type: "richtext", label: "Reason", disabled: true },
  { name: "firstName", type: "text", label: "First Name", disabled: true },
  { name: "middleName", type: "text", label: "Middle Name", disabled: true },
  { name: "lastName", type: "text", label: "Last Name", disabled: true },
  { name: "phone", type: "text", inputType: "tel", label: "Phone", disabled: true },
  { name: "email", type: "text", inputType: "email", label: "Email", disabled: true },
];

enum APPOINTMENT_STATUS {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}

const additionalFields = [
  {
    name: "status",
    type: "select",
    label: "Status",
    options: Object.values(APPOINTMENT_STATUS).map(status => ({ value: status, label: status })),
    disabled: true
  },
  { name: "appointedAt", type: "date", label: "Appointed At", disabled: true },
  { name: "id", type: "text", label: "ID", disabled: true }
];

export default function Appointment() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('phone');
  const { showPopup } = usePopup();
  const user = getDecodedToken();
  const userData = localUserData();

  const {
    appointments,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createAppointment,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    fetchAppointments,
    approveAppointment,
    rejectAppointment,
    completeAppointment
  } = useAppointmentStore();

  const header = useMemo(
    () => [
      { label: 'First Name', key: 'firstName' },
      { label: 'Middle Name', key: 'middleName' },
      { label: 'Last Name', key: 'lastName' },
      { label: 'Phone', key: 'phone' },
      { label: 'Status', key: 'status' },
      { label: 'Appointed At', key: 'appointedAt' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredAppointments = useCallback(async () => {
    const filters: any = {};
    if (!statusFilter && user.role === "RECEPTION") { delete filters.status; }
    else if (statusFilter && user.role === "RECEPTION") { filters.status = statusFilter; } else { filters.status = "APPROVED"; }
    if (searchTerm) filters[searchField] = searchTerm;

    try {
      await fetchAppointments(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [statusFilter, searchTerm, searchField, currentPage, limit, fetchAppointments, showPopup]);

  const handleSearch = useCallback(() => {
    fetchFilteredAppointments();
  }, [fetchFilteredAppointments]);

  useEffect(() => {
    fetchFilteredAppointments();
  }, [statusFilter, limit, currentPage]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = async (id?: string) => {
    setFormData(id ? await getAppointmentById(id) : initialValue);
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
        if (user.role !== 'RECEPTION' || userData.officeId !== formData.officeId) {
          showPopup("You don't have permission to perform this action", 'error');
          handleFormClose();
          return;
        }
        const { rejectionReason } = formData;
        const data = await rejectAppointment(formData.id, rejectionReason);
        showPopup(data.message, 'success');
      } else {
        const data = await createAppointment(formData);
        showPopup(data.message, 'success');
      }
      fetchFilteredAppointments();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this appointment?");
    if (!isConfirmed) return;

    try {
      const data = await deleteAppointment(id);
      showPopup(data.message, 'success');
      fetchFilteredAppointments();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const handleApprove = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to approve this appointment?");
    if (!isConfirmed) return;
    try {
      const data = await approveAppointment(id);
      showPopup(data.message, 'success');
      fetchFilteredAppointments();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const handleComplete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to complete this appointment?");
    if (!isConfirmed) return;
    try {
      const data = await completeAppointment(id);
      showPopup(data.message, 'success');
      fetchFilteredAppointments();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  };

  const actions = useMemo(() => [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteAppointment,
      tooltip: 'Delete',
      condition: (row) => user.role === 'RECEPTION' && userData.officeId !== null
    },
    {
      type: 'approve',
      icon: <ImCheckboxChecked />,
      handler: handleApprove,
      tooltip: 'Approve',
      condition: (appointment: any) => [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.REJECTED].includes(appointment.status) && user.role === 'RECEPTION'
    },
    {
      type: 'complete',
      icon: <IoMdDoneAll />,
      handler: handleComplete,
      tooltip: 'Complete',
      condition: (appointment: any) => appointment.status === APPOINTMENT_STATUS.APPROVED
    },
  ], [handleFormOpen, handleDeleteAppointment, handleApprove, handleComplete]);

  const fields = formData.id ? [...commonFields, ...additionalFields] : commonFields;


  return (
    <Layout title="Appointment">
      <div>
        <div className="flex justify-between my-4">
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">Status</option>
              {Object.values(APPOINTMENT_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              {/* <option value="firstName">First Name</option>
              <option value="middleName">Middle Name</option>
              <option value="lastName">Last Name</option> */}
              <option value="phone">Bilbila</option>
              <option value="email">Imeeyilii</option>
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
        </div>

        <TailwindTable header={header} data={appointments} actions={actions} />

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
