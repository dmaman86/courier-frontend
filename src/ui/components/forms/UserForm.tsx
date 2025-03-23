import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { resourceAdapter, userAdapter } from "@/adapters";
import { useAsync, useFetch } from "@/hooks";
import { BranchBase, FormProps, OfficeBase, Role, ROLES } from "@/models";
import { serviceRequest } from "@/services";
import { urlPaths } from "@/utilities";
import { Input } from "../Input";
import { ControlledSelect } from "../ControlledSelect";
import { Button, Stack } from "@mui/material";

const dynamicSchema = yup.object({
  id: yup.mixed().nullable(),
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits"),

  roles: yup
    .array()
    .of(
      yup.object({
        id: yup.mixed(),
        name: yup.string().required(),
      }),
    )
    .min(1, "At least one role is required"),

  // Dynamic part using lazy
  office: yup.lazy((_, { parent }) => {
    const isClient = parent.roles?.some(
      (role: any) => role.name === ROLES.CLIENT,
    );
    return isClient
      ? yup
          .object({
            id: yup.mixed().nullable(),
            name: yup.string().required(),
          })
          .nullable()
          .required("Office is required")
      : yup.mixed().notRequired();
  }),

  branches: yup.lazy((_, { parent }) => {
    const isClient = parent.roles?.some(
      (role: any) => role.name === ROLES.CLIENT,
    );
    const hasOffice = !!parent.office?.id;
    return isClient && hasOffice
      ? yup
          .array()
          .of(
            yup.object({
              id: yup.mixed().nullable(),
              city: yup.string().required(),
              address: yup.string().required(),
            }),
          )
          .min(1, "At least one branch is required")
      : yup.mixed().notRequired();
  }),
});

export const UserForm = ({ id, onSubmit, onClose }: FormProps) => {
  const { callEndPoint } = useFetch();

  const [roles, setRoles] = useState<Role[] | null>(null);

  const [offices, setOffices] = useState<OfficeBase[] | null>(null);

  const [branches, setBranches] = useState<BranchBase[] | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    clearErrors,
    reset,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(dynamicSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      id: null,
      fullName: "",
      email: "",
      phoneNumber: "",
      roles: [],
      office: undefined,
      branches: [],
    },
  });

  const selectedRoles = watch("roles");
  const selectedOffice = watch("office");

  const isClient = selectedRoles?.some((role) => role.name === ROLES.CLIENT);

  useAsync(
    async () => {
      if (id) {
        return await callEndPoint(
          serviceRequest.getItem(`${urlPaths.user.base}/${id}`),
          userAdapter.userFormDtoAdapter,
        );
      }
      return { data: null, error: null };
    },
    (response) => {
      if (!response.error && response.data) {
        reset(response.data);
      }
    },
    () => {},
    [id],
  );

  useAsync(
    async () =>
      await callEndPoint(
        serviceRequest.getItem(urlPaths.role.getList),
        (data) => userAdapter.listAdapter(data, userAdapter.roleAdapter),
      ),
    (response) => {
      if (!response.error && response.data) {
        setRoles(response.data);
      }
    },
    () => {},
    [],
  );

  useAsync(
    async () =>
      await callEndPoint(
        serviceRequest.getItem(urlPaths.office.getList),
        (data) =>
          resourceAdapter.listAdapter(data, resourceAdapter.officeBaseAdapter),
      ),
    (response) => {
      if (!response.error && response.data) setOffices(response.data);
    },
    () => {},
    [],
  );

  useEffect(() => {
    if (selectedOffice?.id) {
      const fetchBranches = async () => {
        const res = await callEndPoint(
          serviceRequest.getItem(
            `${urlPaths.branch.getByOffice}/${selectedOffice.id}`,
          ),
          (data) =>
            resourceAdapter.listAdapter(
              data,
              resourceAdapter.branchBaseAdapter,
            ),
        );
        if (!res.error && res.data) setBranches(res.data);
      };
      fetchBranches();
    } else {
      setBranches([]);
      setValue("branches", []);
    }
  }, [selectedOffice?.id, setValue]);

  useEffect(() => {
    if (!isClient) {
      setValue("office", undefined);
      setValue("branches", []);
    }
  }, [isClient, setValue]);

  const onSubmitForm = (data: any) => {
    // const user = userAdapter.userFormDtoToEntity(data);
    console.log("Submitting...");
    console.log(data);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row mb-3">
        <div className="col-12">
          <Input
            register={register}
            label="Full Name"
            name="fullName"
            type="text"
            errors={errors}
            watch={watch}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <Input
            register={register}
            label="Email"
            name="email"
            type="email"
            errors={errors}
            watch={watch}
          />
        </div>
        <div className="col-12 col-md-6">
          <Input
            register={register}
            label="Phone Number"
            name="phoneNumber"
            type="text"
            errors={errors}
            watch={watch}
          />
        </div>
      </div>
      <div className="row mb-3 align-items-start">
        <div className={`col-12 ${isClient ? "col-md-6" : "text-center"}`}>
          {roles && (
            <ControlledSelect<Role>
              name="roles"
              label="Roles"
              control={control}
              multiple
              options={roles.map((role) => ({ value: role, label: role.name }))}
              errors={errors}
              clearErrors={clearErrors}
              trigger={trigger}
            />
          )}
        </div>
        {isClient && offices && (
          <div className="col-12 col-md-6">
            <ControlledSelect<OfficeBase>
              name="office"
              label="Office"
              control={control}
              options={offices.map((office) => ({
                value: office,
                label: office.name,
              }))}
              errors={errors}
              clearErrors={clearErrors}
              trigger={trigger}
            />
          </div>
        )}
      </div>

      {isClient && selectedOffice && branches && (
        <div className="row mb-3">
          <div className="col-12">
            <ControlledSelect<BranchBase>
              name="branches"
              label="Branches"
              control={control}
              multiple
              options={branches.map((branch) => ({
                value: branch,
                label: `${branch.city}\n${branch.address}`,
              }))}
              errors={errors}
              clearErrors={clearErrors}
              trigger={trigger}
            />
          </div>
        </div>
      )}

      <div className="col pt-3 text-center">
        <Stack spacing={2} direction="row" justifyContent="right">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!isValid}
          >
            Submit
          </Button>
          {onClose && (
            <Button type="button" color="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
        </Stack>
      </div>
    </form>
  );
};
