import { useState, useEffect, useCallback, useMemo } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useEmployeeStore } from '../../store/employee.store';
import { getDecodedToken, localUserData } from '../../utils/authUtils';
import { useOfficeStore } from '../../store/office.store';

const initialValue = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "MALE",
  phone: "",
  email: "",
  position: "",
  salary: 0,
};

enum EMPLOYEE_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  TERMINATED = "TERMINATED",
  ON_LEAVE = "ON_LEAVE",
  RETIRED = "RETIRED"
}

const commonFields = [
  { name: "firstName", type: "text", label: "First Name" },
  { name: "middleName", type: "text", label: "Father's Name" },
  { name: "lastName", type: "text", label: "Grandfather's Name" },
  { name: "gender", type: "select", label: "Gender", options: [{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }] },
  { name: "phone", type: "text", inputType: "tel", label: "Phone Number" },
  { name: "email", type: "text", inputType: "email", label: "Email" },
  { name: "position", type: "text", label: "Position" },
  { name: "salary", type: "text", inputType: "number", label: "Salary" },
];

const additionalFields = [
  { name: "status", type: "select", label: "Status", options: Object.values(EMPLOYEE_STATUS).map(status => ({ value: status, label: status.replace(/_/g, ' ') })) },
  { name: "updatedAt", type: "date", label: "Updated At", disabled: true },
  { name: "registeredAt", type: "date", label: "Registered At", disabled: true },
  { name: "id", type: "text", label: "Employee ID", disabled: true }
];

export default function Employee() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const [officeId, setOfficeId] = useState<string>("");
  const { fetchOffices, offices } = useOfficeStore();

  const { showPopup } = usePopup();

  const {
    employees,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createEmployee,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
  } = useEmployeeStore();

  const user = getDecodedToken();
  const userData = localUserData();

  const header = useMemo(
    () => [
      { label: 'First Name', key: 'firstName' },
      { label: 'Father\'s Name', key: 'middleName' },
      { label: 'Grandfather\'s Name', key: 'lastName' },
      { label: 'Position', key: 'position' },
      { label: 'Status', key: 'status' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredEmployees = useCallback(async () => {
    const filters: any = { status: statusFilter, officeId: officeId };
    if (searchTerm) {
      if (searchField === 'name') {
        const [firstName, middleName, lastName] = searchTerm.split(" ");
        if (firstName && firstName.length > 2) filters.firstName = firstName;
        if (middleName && middleName.length > 2) filters.middleName = middleName;
        if (lastName && lastName.length > 2) filters.lastName = lastName;
      } else {
        filters[searchField] = searchTerm;
      }
    }
    try {
      await fetchEmployees(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [fetchEmployees, currentPage, limit, statusFilter, searchTerm, searchField, showPopup, officeId]);

  useEffect(() => {
    fetchFilteredEmployees();
    if (offices.length === 0) {
      fetchOffices()
    }
  }, [fetchFilteredEmployees]);

  const handleSearch = useCallback(() => {
    fetchFilteredEmployees();
  }, [fetchFilteredEmployees]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = useCallback(async (id?: string) => {
    setFormData(id ? await getEmployeeById(id) : initialValue);
    setOpen(true);
  }, [getEmployeeById]);

  const handleFormClose = useCallback(() => {
    setOpen(false);
    setFormData(initialValue);
  }, []);

  const onFormChange = useCallback((e: any) => {
    setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
  }, []);

  const handleFormSubmit = useCallback(async () => {
    try {
      formData.email = formData.email?.trim() || undefined;
      if (formData.id) {
        if (user.role !== 'HR' || userData.officeId !== formData.officeId) {
          showPopup("You don't have permission to perform this action", 'error');
          handleFormClose();
          return;
        }
        const data = await updateEmployee(formData.id, { ...formData, id: undefined, registeredAt: undefined, updatedAt: undefined, officeId: undefined });
        showPopup(data.message, 'success');
      } else {
        delete formData.id;
        const data = await createEmployee(formData);
        showPopup(data.message, 'success');
      }
      fetchFilteredEmployees();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
    }
  }, [formData, updateEmployee, createEmployee, fetchFilteredEmployees, handleFormClose, showPopup]);

  const handleDeleteEmployee = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const data = await deleteEmployee(id);
        showPopup(data.message, 'success');
        fetchFilteredEmployees();
      } catch (err: any) {
        showPopup(err.message, 'error');
      }
    }
  }, [deleteEmployee, fetchFilteredEmployees, showPopup]);

  const actions = useMemo(() => [
    {
      type: 'edit',
      icon: <FaEdit />,
      handler: handleFormOpen,
      tooltip: 'Edit Employee',
    },
    {
      type: 'delete',
      icon: <MdDelete />,
      handler: handleDeleteEmployee,
      tooltip: 'Delete Employee',
      condition: (row) => user.role === 'HR' && userData.officeId === row.officeId,
    },
  ], [handleFormOpen, handleDeleteEmployee]);

  const fields = useMemo(() => (formData.id ? [...commonFields, ...additionalFields] : commonFields), [formData.id]);

  return (
    <Layout title="Employee Management">
      <div>
        <div className="flex justify-between my-4 items-center">
          <div className="flex space-x-4">
            {userData.officeId === null && <select
              value={officeId}
              onChange={(e: any) => setOfficeId(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">Office</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">Employee Status</option>
              {Object.values(EMPLOYEE_STATUS).map((status) => (
                <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="name">Name</option>
              <option value="phone">Phone Number</option>
              <option value="email">Email</option>
            </select>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            />
          </div>
          {
            user.role === "HR" && <button
              className="bg-main-black text-white py-2 px-4 rounded-lg font-bold"
              onClick={() => setOpen(true)}
            >
              Add Employee
            </button>
          }
        </div>

        <TailwindTable header={header} data={employees} actions={actions} />

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
