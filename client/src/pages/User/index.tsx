import { useEffect, useCallback, useMemo, useState } from 'preact/hooks';
import Layout from '../../components/Layout';
import PaginationMega from '../../components/PaginationMega';
import TailwindTable from '../../components/Tailwind-Table';
import { useUserStore } from '../../store/user.store';
import FormDialog from '../../components/form-dialog';
import { usePopup } from '../../components/popup/context';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { getDecodedToken, localUserData } from '../../utils/authUtils';
import { useOfficeStore } from '../../store/office.store';

const initialValue = {
  id: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  status: ""
};

enum USER_ROLE {
  DATABASE_ADMIN = "DATABASE_ADMIN",
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  HEAD = "HEAD",
  HR = "HR",
  FINANCE = "FINANCE",
  RECEPTION = "RECEPTION",
  LAND_BANK = "LAND_BANK",
  OFFICER = "OFFICER",
  OTHER = "OTHER"
}

enum USER_STATUS {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DEACTIVATED = "DEACTIVATED",
  BLOCKED = "BLOCKED"
}

const commonFields = [
  { name: "email", type: "text", inputType: "email", label: "Email" },
  { name: "firstName", type: "text", label: "First Name" },
  { name: "middleName", type: "text", label: "Father's Name" },
  { name: "lastName", type: "text", label: "Grandfather's Name" },
  { name: "phone", type: "text", inputType: "tel", label: "Phone" },
  {
    name: "role",
    type: "select",
    label: "Role",
    options: Object.values(USER_ROLE).map(role => ({ value: role, label: role.replace(/_/g, ' ') }))
  },
  {
    name: "status",
    type: "select",
    label: "Status",
    options: Object.values(USER_STATUS).map(status => ({ value: status, label: status }))
  }
];

const additionalFields = [
  { name: "username", type: "text", label: "Username" },
  { name: "updatedAt", type: "date", label: "Updated At", disabled: true },
  { name: "createdAt", type: "date", label: "Created At", disabled: true },
  { name: "id", type: "text", label: "User ID", disabled: true }
];

export default function User() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<any>(initialValue);
  const { showPopup } = usePopup();
  const { fetchOffices, offices } = useOfficeStore();
  const [officeId, setOfficeId] = useState<string>("");

  const user = getDecodedToken();
  const userData = localUserData();

  const {
    users,
    totalItems,
    currentPage,
    limit,
    setCurrentPage,
    setLimit,
    loading,
    error,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    fetchUsers
  } = useUserStore();

  const header = useMemo(
    () => [
      { label: 'First Name', key: 'firstName' },
      { label: 'Father\'s Name', key: 'middleName' },
      { label: 'Grandfather\'s Name', key: 'lastName' },
      { label: 'Email', key: 'email' },
      { label: 'Phone', key: 'phone' },
      { label: 'Role', key: 'role' },
      { label: 'Status', key: 'status' },
    ],
    []
  );

  const totalPages = useMemo(() => Math.ceil(totalItems / limit), [totalItems, limit]);

  const fetchFilteredUsers = useCallback(async () => {
    const filters: any = { role: roleFilter, status: statusFilter, officeId: officeId };
    if (searchTerm) {
      if (searchField === 'name') {
        const [firstName, middleName, lastName] = searchTerm.split(" ");
        if (firstName) filters.firstName = firstName;
        if (middleName) filters.middleName = middleName;
        if (lastName) filters.lastName = lastName;
      } else {
        filters[searchField] = searchTerm;
      }
    }
    try {
      await fetchUsers(currentPage, limit, filters);
    } catch (error) {
      showPopup(error.message, 'error');
    }
  }, [fetchUsers, currentPage, limit, roleFilter, statusFilter, searchTerm, searchField, officeId]);

  useEffect(() => {
    fetchFilteredUsers();
    if (offices.length === 0) {
      fetchOffices()
    }
  }, [fetchFilteredUsers]);

  const handleSearch = useCallback(() => {
    fetchFilteredUsers();
  }, [fetchFilteredUsers]);

  const handlePageChange = useCallback((pageIndex: number) => {
    setCurrentPage(pageIndex);
  }, [setCurrentPage]);

  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setCurrentPage(0);
  }, [setLimit, setCurrentPage]);

  const handleFormOpen = useCallback(async (id) => {
    const data = await getUserById(id);
    setFormData(data);
    setOpen(true);
  }, [getUserById]);

  const handleFormClose = useCallback(() => {
    setOpen(false);
    setFormData(initialValue);
  }, []);

  const onFormChange = useCallback((e: any) => {
    setFormData((prevData) => ({ ...prevData, [e.target.name]: e.target.value }));
  }, []);

  const handleFormSubmit = useCallback(async () => {
    try {
      if (formData.id) {
        if (user.role !== 'DATABASE_ADMIN' || userData.officeId !== formData.officeId) {
          showPopup("You don't have permission to perform this action", 'error');
          handleFormClose();
          return;
        }
        if (user.userId === formData.id) {
          formData.role = "DATABASE_ADMIN";
        }
        const data = await updateUser(formData.id, {
          ...formData,
          id: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          lastSeen: undefined
        });
        showPopup(data.message, 'success');
      } else {
        delete formData.id;
        const data = await createUser(formData);
        showPopup(data.message, 'success');
      }
      fetchFilteredUsers();
      handleFormClose();
    } catch (err: any) {
      showPopup(err.message, 'error');
      console.error(err);
    }
  }, [createUser, updateUser, fetchFilteredUsers, formData, handleFormClose, showPopup]);

  const handleDeleteUser = useCallback(async (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const data = await deleteUser(id);
        showPopup(data.message, 'success');
        fetchFilteredUsers();
      } catch (err: any) {
        showPopup(err.message, 'error');
        console.error(err);
      }
    }
  }, [deleteUser, fetchFilteredUsers, showPopup]);

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
      handler: handleDeleteUser,
      tooltip: 'Delete',
      condition: (row) => user.role === "DATABASE_ADMIN" && userData.officeId === row.officeId
    },
  ], [handleFormOpen, handleDeleteUser]);

  const fields = useMemo(() => (formData.id ? [...commonFields, ...additionalFields] : commonFields), [formData.id]);

  return (
    <Layout title="User Management System">
      <div>
        <div className="flex justify-between my-4 items-center">
          <div className="flex space-x-4">
            {userData.officeId === null && (
              <select
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
              </select>
            )}
            <select
              value={roleFilter}
              onChange={(e: any) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">Roles</option>
              {Object.values(USER_ROLE).map((role) => (
                <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="">User Status</option>
              {Object.values(USER_STATUS).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <select
              value={searchField}
              onChange={(e: any) => setSearchField(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:border-main-orange bg-main-white"
            >
              <option value="userId">User ID</option>
              <option value="name">Name</option>
              <option value="phone">Phone</option>
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
          {user.role === 'DATABASE_ADMIN' && (
            <button
              className="bg-main-black text-white py-2 px-4 rounded-lg font-bold"
              onClick={() => setOpen(true)}
            >
              Add User
            </button>
          )}
        </div>

        <TailwindTable header={header} data={users} actions={actions} />

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
