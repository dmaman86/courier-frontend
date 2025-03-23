import { useState } from "react";

import { resourceAdapter } from "@/adapters";
import { useAuth } from "@/hooks";
import { Branch, OfficePage, PageProps, ROLES, ValueColumn } from "@/models";
import { serviceRequest } from "@/services";
import { urlPaths } from "@/utilities";
import {
  BranchForm,
  ItemsContainer,
  OfficeDetails,
  OfficeForm,
} from "../components";

export const Offices = ({ allowedActions }: PageProps) => {
  const { auth } = useAuth();

  const defaultActions = { create: [], update: [], delete: [] };
  allowedActions = allowedActions || defaultActions;

  const isAdmin = auth?.roles?.some((role) => role.name === ROLES.ADMIN);

  const getOffices = (page: number, size: number) => {
    return serviceRequest.getItem(
      `${urlPaths.office.base}?page=${page}&size=${size}`,
    );
  };

  const createOffice = (item: any) => {
    if (!item.branches || !item.branches.length) {
      const office = resourceAdapter.officeBaseAdapter(item);
      return serviceRequest.postItem(urlPaths.office.createBase, office);
    } else {
      const office = resourceAdapter.officeAdapter(item);
      return serviceRequest.postItem(urlPaths.office.base, office);
    }
  };

  const updateOffice = (id: string | number, item: any) => {
    const office = resourceAdapter.dataToOfficeEntity(item);
    return serviceRequest.putItem(`${urlPaths.office.base}/${id}`, office);
  };

  const deleteOffice = (id: string | number) =>
    serviceRequest.deleteItem(`${urlPaths.office.base}/${id}`);

  const searchOffice = (query: string, page: number, size: number) =>
    serviceRequest.getItem(
      `${urlPaths.office.search}?query=${query}&page=${page}&size=${size}`,
    );

  const [officeColumns, setOfficeColumns] = useState<ValueColumn[]>([
    { key: "name", label: "Name" },
    { key: "countBranches", label: "Counter Branches" },
    { key: "countContacts", label: "Counter Contacts" },
  ]);

  const mapOfficeInfo = (office: OfficePage) => [
    { key: "name", content: `${office.name}` },
    { key: "countBranches", content: `${office.countBranches}` },
    { key: "countContacts", content: `${office.countContacts}` },
  ];

  const formatMessage = (office: OfficePage) => {
    return `Are you sure you want to delete:
                Office Name: ${office.name}`;
  };

  const getBranches = (page: number, size: number) => {
    return serviceRequest.getItem(
      `${urlPaths.branch.base}?page=${page}&size=${size}`,
    );
  };

  const createBranch = (item: any) => {
    const branch = resourceAdapter.branchAdapter(item);
    return serviceRequest.postItem(urlPaths.branch.base, branch);
  };

  const updateBranch = (id: string | number, item: any) => {
    const branch = resourceAdapter.branchAdapter(item);
    return serviceRequest.putItem(`${urlPaths.branch.base}/${id}`, branch);
  };

  const deleteBranch = (id: string | number) =>
    serviceRequest.deleteItem(`${urlPaths.branch.base}/${id}`);

  const searchBranch = (query: string, page: number, size: number) =>
    serviceRequest.getItem(
      `${urlPaths.branch.search}?query=${query}&page=${page}&size=${size}`,
    );

  const [branchColumns, setBranchColumns] = useState<ValueColumn[]>([
    { key: "city", label: "City" },
    { key: "address", label: "Address" },
    { key: "officeName", label: "Office Name" },
  ]);

  const mapBranchInfo = (branch: Branch) => [
    { key: "city", content: `${branch.city}` },
    { key: "address", content: `${branch.address}` },
    { key: "officeName", content: `${branch.office.name}` },
  ];

  const formatBranchMessage = (branch: Branch) => {
    return `Are you sure you want to delete:
                Branch City: ${branch.city}
                Branch Address: ${branch.address}`;
  };

  return (
    <>
      {isAdmin && (
        <ItemsContainer<OfficePage>
          auth={auth}
          header={{
            title: "Offices",
            placeholder: "Search offices...",
            buttonName: "Create Office",
          }}
          actions={{
            getItems: getOffices,
            createItem: createOffice,
            updateItem: updateOffice,
            deleteItem: deleteOffice,
            searchItem: searchOffice,
          }}
          adapters={{
            itemAdapter: resourceAdapter.officePageAdapter,
            listAdapter: resourceAdapter.listAdapter,
          }}
          list={{
            columns: officeColumns,
            mapItemRow: mapOfficeInfo,
            itemForm: (id, onSubmit, onClose) => (
              <OfficeForm id={id} onSubmit={onSubmit} onClose={onClose} />
            ),
          }}
          allowedActions={allowedActions}
          formatMessage={formatMessage}
          rowExpandable={(office) =>
            office.countBranches > 0 || office.countContacts > 0
          }
          expandContent={(id) => <OfficeDetails id={id} />}
        />
      )}

      <div style={{ marginTop: "3rem" }}>
        <ItemsContainer<Branch>
          auth={auth}
          header={{
            title: "Branches",
            placeholder: "Search branches...",
            buttonName: "Create Branch",
          }}
          actions={{
            getItems: getBranches,
            createItem: createBranch,
            updateItem: updateBranch,
            deleteItem: deleteBranch,
            searchItem: searchBranch,
          }}
          adapters={{
            itemAdapter: resourceAdapter.branchAdapter,
            listAdapter: resourceAdapter.listAdapter,
          }}
          list={{
            columns: branchColumns,
            mapItemRow: mapBranchInfo,
            itemForm: (id, onSubmit, onClose) => (
              <BranchForm id={id} onSubmit={onSubmit} onClose={onClose} />
            ),
          }}
          allowedActions={allowedActions}
          formatMessage={formatBranchMessage}
        />
      </div>
    </>
  );
};
