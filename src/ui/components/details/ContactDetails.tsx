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
import { useAsync, useFetch, useList } from "@/hooks";
import { Branch, Contact, ContactBase } from "@/models";
import { serviceRequest } from "@/services";
import { urlPaths } from "@/utilities";

export const ContactDetails = ({ id }: { id: string | number }) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [officeId, setOfficeId] = useState<string | number | null>(null);

  const { items, setAllItems } = useList<Branch>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalItems: 0,
  });

  const { callEndPoint } = useFetch();

  useAsync(
    async () => {
      if (!contact) {
        return await callEndPoint(
          serviceRequest.getItem(`${urlPaths.contact.base}/${id}`),
          resourceAdapter.contactAdapter,
        );
      }
      return { error: null, data: null };
    },
    (response) => {
      if (!response.error && response.data) {
        setContact(response.data);
      }
    },
    () => {},
    [id, contact],
  );

  useEffect(() => {
    if (contact && !officeId) {
      setOfficeId(contact.office.id);
    }
  }, [contact, officeId]);

  const fetchBranches = async () => {
    if (officeId) {
      const response = await callEndPoint(
        serviceRequest.getItem(
          `${urlPaths.branch.base}/contact/${id}/paged?page=${pagination.page}&size=${pagination.size}`,
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
              <TableCell>Office</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.city}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{branch.office.name}</TableCell>
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
