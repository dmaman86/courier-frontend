import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { useDebounce, useFetch, useList, useSnackbar } from "@/hooks";
import { AuthState, BaseEntity, ItemsContainerProps } from "@/models";
import { SnackbarConfirmAction } from "./snackbar";

const isSelf = <T extends BaseEntity>(item: T, auth: AuthState): boolean => {
  const isSame = (
    item: Partial<{ id: string | number; phoneNumber?: string }>,
  ): boolean => {
    return (
      item.id === auth.id &&
      !!item.phoneNumber &&
      item.phoneNumber === auth.phoneNumber
    );
  };

  return isSame(item as { id: string | number; phoneNumber?: string });
};

export const ItemsContainer = <T extends BaseEntity>({
  auth,
  header,
  actions,
  adapters,
  list,
  allowedActions,
  formatMessage,
  rowExpandable,
  expandContent,
}: ItemsContainerProps<T>) => {
  const { items, setAllItems, addItem, updateItem, removeItem, getItemById } =
    useList<T>([]);
  const { success, warning } = useSnackbar();
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 5,
    totalItems: 0,
  });
  const [displayForm, setDisplayForm] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const debouncedSearch = useDebounce(search, 500);

  const { callEndPoint } = useFetch();

  const fetchItems = async () => {
    const response = debouncedSearch
      ? await callEndPoint(
          actions.searchItem(debouncedSearch, pagination.page, pagination.size),
          (data) => adapters.listAdapter(data, adapters.itemAdapter),
        )
      : await callEndPoint(
          actions.getItems(pagination.page, pagination.size),
          (data) => adapters.listAdapter(data, adapters.itemAdapter),
        );

    if (!response.error && response.data && "content" in response.data) {
      setAllItems(response.data.content);
      setPagination((prev) => ({
        ...prev,
        totalItems: response.data.totalElements,
      }));
    }
  };

  useEffect(() => {
    fetchItems();
  }, [pagination.page, pagination.size, debouncedSearch]);

  const handleCreate = () => {
    setSelectedId(null);
    setDisplayForm(true);
  };

  const handleEdit = (id: string | number) => {
    setSelectedId(id);
    setDisplayForm(true);
  };

  const handleDelete = async (id: string | number) => {
    const item = getItemById(id);
    if (!item) return;

    warning(formatMessage(item), (key) =>
      SnackbarConfirmAction(key, async () => {
        await callEndPoint(actions.deleteItem(id));
        removeItem(id);
        success("Item deleted successfully");
      }),
    );
  };

  const handleClose = () => {
    setSelectedId(null);
    setDisplayForm(false);
  };

  const handleFormSubmit = async (item: any) => {
    const res = selectedId
      ? await callEndPoint(actions.updateItem(selectedId, item))
      : await callEndPoint(actions.createItem(item));

    if (!res.error && res.data) {
      if (selectedId) updateItem(adapters.itemAdapter(res.data));
      else addItem(adapters.itemAdapter(res.data));
    }
    setSelectedId(null);
    setDisplayForm(false);
  };

  const onPageChange = (_: any, newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const onRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPagination({
      page: 0,
      size: newSize,
      totalItems: pagination.totalItems,
    });
  };

  const validAllowedActions = (actions: string[]) => {
    return actions.some((role) => auth.roles.some((r) => r.name === role));
  };

  const canCreate = validAllowedActions(allowedActions.create);

  const displayActions =
    validAllowedActions(allowedActions.update) ||
    validAllowedActions(allowedActions.delete);

  const canUpdate = (item: T) => displayActions && !isSelf(item, auth);

  const canDelete = (item: T) => displayActions && !isSelf(item, auth);

  const handleRowClick = (item: T) => {
    if (!isExpandable(item)) return;

    setSelectedId(selectedId === item.id! ? null : item.id!);
    setDisplayForm(false);
  };

  const isExpandable = (item: T) => {
    return rowExpandable ? rowExpandable(item) : false;
  };

  const isOpen = (id: string | number) => {
    return selectedId === id;
  };

  return (
    <>
      <div className="container">
        <div className="row align-items-center">
          <div className="col-12 col-md-4">
            <h2>{header.title}</h2>
          </div>
          <div className="col-12 col-md-8 mt-3 mt-md-0">
            <div className="row d-flex justify-content-end">
              <div className="col-6">
                <TextField
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={search}
                  placeholder={header.placeholder}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {canCreate && (
                <div className="col-6 d-flex justify-content-center">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleCreate}
                  >
                    {header.buttonName}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedId === null && displayForm && (
          <div className="row mt-3">
            <Paper variant="outlined" sx={{ position: "relative", padding: 3 }}>
              <Tooltip title="Close">
                <IconButton
                  size="small"
                  sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                  onClick={handleClose}
                >
                  <CloseIcon
                    fontSize="small"
                    sx={{
                      color: "error.main",
                      "&:hover": { color: "error.dark" },
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Box sx={{ marginTop: 2 }}>
                {list.itemForm(null, handleFormSubmit, handleClose)}
              </Box>
            </Paper>
          </div>
        )}
        <div className="row align-items-center">
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label="items table">
              <TableHead>
                <TableRow>
                  {list.columns.map((col) => (
                    <TableCell key={col.key}>{col.label}</TableCell>
                  ))}
                  {displayActions && <TableCell>Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  return (
                    <React.Fragment key={item.id}>
                      <TableRow
                        hover
                        onClick={() => handleRowClick(item)}
                        style={{
                          cursor: isExpandable(item) ? "pointer" : "default",
                        }}
                      >
                        {list.mapItemRow(item).map((col) => (
                          <TableCell key={`${item.id}-${col.key}`}>
                            {col.content}
                          </TableCell>
                        ))}
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Stack spacing={2} direction="row">
                            {canUpdate(item) && (
                              <button
                                className="btn btn-warning"
                                onClick={() => handleEdit(item.id!)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                            )}
                            {canDelete(item) && (
                              <button
                                className="btn btn-danger"
                                onClick={() => handleDelete(item.id!)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>

                      {isExpandable(item) &&
                        isOpen(item.id!) &&
                        !displayForm && (
                          <TableRow>
                            <TableCell
                              colSpan={
                                list.columns.length + (displayActions ? 1 : 0)
                              }
                            >
                              <Paper variant="outlined" sx={{ padding: 2 }}>
                                {expandContent && expandContent(item.id!)}
                              </Paper>
                            </TableCell>
                          </TableRow>
                        )}
                      {selectedId === item.id && displayForm && (
                        <TableRow>
                          <TableCell colSpan={list.columns.length + 1}>
                            <Paper
                              variant="outlined"
                              sx={{ position: "relative", padding: 3 }}
                            >
                              <Box sx={{ marginTop: 2 }}>
                                {list.itemForm(
                                  item.id,
                                  handleFormSubmit,
                                  handleClose,
                                )}
                              </Box>
                            </Paper>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.totalItems}
            rowsPerPage={pagination.size}
            page={pagination.page}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </div>
      </div>
    </>
  );
};
