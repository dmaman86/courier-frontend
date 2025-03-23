import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";

import { resourceAdapter } from "@/adapters";
import { useFetch, useList } from "@/hooks";
import { Branch, ContactBase } from "@/models";
import { serviceRequest } from "@/services";
import { urlPaths } from "@/utilities";

export const OfficeDetails = ({ id }: { id: string | number }) => {
  return (
    <Box>
      <BranchesSection officeId={id} />
      <ContactsSection officeId={id} />
    </Box>
  );
};

const BranchesSection = ({ officeId }: { officeId: string | number }) => {
  const { items, setAllItems } = useList<Branch>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalItems: 0,
  });

  const { callEndPoint } = useFetch();

  const fetchBranches = async () => {
    const response = await callEndPoint(
      serviceRequest.getItem(
        `${urlPaths.branch.getByOffice}/${officeId}/paged?page=${pagination.page}&size=${pagination.size}`,
      ),
      (data) =>
        resourceAdapter.listAdapter(data, resourceAdapter.branchAdapter),
    );
    if (!response.error && response.data) {
      setAllItems(response.data.content);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.totalElements,
      }));
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [pagination.page, pagination.size, officeId]);

  return (
    <Box sx={{ mb: 3 }}>
      <h5>Branches</h5>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>City</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.city}</TableCell>
                <TableCell>{branch.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={pagination.totalItems}
        rowsPerPage={pagination.size}
        page={pagination.page}
        onPageChange={(_, newPage) =>
          setPagination({ ...pagination, page: newPage })
        }
        onRowsPerPageChange={(e) =>
          setPagination({
            page: 0,
            size: parseInt(e.target.value, 10),
            totalItems: pagination.totalItems,
          })
        }
      />
    </Box>
  );
};

const ContactsSection = ({ officeId }: { officeId: string | number }) => {
  const { items, setAllItems } = useList<ContactBase>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalItems: 0,
  });

  const { callEndPoint } = useFetch();

  const fetchContacts = async () => {
    const response = await callEndPoint(
      serviceRequest.getItem(
        `${urlPaths.contact.getByOffice}/${officeId}/paged?page=${pagination.page}&size=${pagination.size}`,
      ),
      (data) =>
        resourceAdapter.listAdapter(data, resourceAdapter.contactBaseAdapter),
    );
    if (!response.error && response.data) {
      setAllItems(response.data.content);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.totalElements,
      }));
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [pagination.page, pagination.size, officeId]);

  return (
    <Box sx={{ mb: 3 }}>
      <h5>Contacts</h5>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Full Name</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Office</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.fullName}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell>{contact.office.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={pagination.totalItems}
        rowsPerPage={pagination.size}
        page={pagination.page}
        onPageChange={(_, newPage) =>
          setPagination({ ...pagination, page: newPage })
        }
        onRowsPerPageChange={(e) =>
          setPagination({
            page: 0,
            size: parseInt(e.target.value, 10),
            totalItems: pagination.totalItems,
          })
        }
      />
    </Box>
  );
};
