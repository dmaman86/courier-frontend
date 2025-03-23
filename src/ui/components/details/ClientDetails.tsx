import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState, useEffect } from "react";

import { userAdapter } from "@/adapters";
import { useFetch } from "@/hooks";
import { Client } from "@/models";
import { serviceRequest } from "@/services";
import { urlPaths } from "@/utilities";

export const ClientDetails = ({ id }: { id: string | number }) => {
  const { loading, callEndPoint } = useFetch();

  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    if (!client) {
      const fetchClient = async () => {
        const response = await callEndPoint(
          serviceRequest.getItem(`${urlPaths.user.base}/${id}`),
          userAdapter.clientAdapter,
        );
        if (!response.error && response.data) {
          setClient(response.data);
        }
      };
      fetchClient();
    }
  }, [id, client]);

  if (loading || !client) {
    return (
      <div style={{ padding: "1rem", textAlign: "center" }}>
        <CircularProgress size={24} />
      </div>
    );
  }

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>City</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Office Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {client.branches.map((branch) => (
              <TableRow key={branch.id}>
                <TableCell>{branch.city}</TableCell>
                <TableCell>{branch.address}</TableCell>
                <TableCell>{client.office.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
