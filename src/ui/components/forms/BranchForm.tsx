import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Stack } from "@mui/material";

import { useFetch } from "@/hooks";
import { FormProps, OfficeBase } from "@/models";
import { urlPaths } from "@/utilities";
import { serviceRequest } from "@/services";
import { resourceAdapter } from "@/adapters";
import { Input } from "../Input";
import { ControlledSelect } from "../ControlledSelect";

const validationSchema = yup.object({
  id: yup.mixed().nullable(),
  city: yup.string().required("This field is required"),
  address: yup.string().required("This field is required"),
  office: yup
    .object({
      id: yup.mixed().nullable().required("Office is required"),
      name: yup.string().required("Office name is required"),
    })
    .required("This field is required"),
});

export const BranchForm = ({ id, onSubmit, onClose }: FormProps) => {
  const { callEndPoint } = useFetch();
  const [offices, setOffices] = useState<OfficeBase[] | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    clearErrors,
    trigger,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      id: null,
      city: "",
      address: "",
      office: { id: undefined, name: "" },
    },
  });

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        const res = await callEndPoint(
          serviceRequest.getItem(`${urlPaths.branch.base}/${id}`),
          resourceAdapter.branchAdapter,
        );
        if (!res.error && res.data) {
          reset(res.data);
        }
      };
      fetchBranch();
    }
  }, [id, reset]);

  useEffect(() => {
    if (!offices) {
      const fetchOffices = async () => {
        const res = await callEndPoint(
          serviceRequest.getItem(urlPaths.office.getList),
          (data: any) =>
            resourceAdapter.listAdapter(
              data,
              resourceAdapter.officeBaseAdapter,
            ),
        );
        if (!res.error && res.data) {
          setOffices(res.data);
        }
      };
      fetchOffices();
    }
  }, [offices]);

  const onSubmitForm = (data: any) => {
    console.log(data);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <Input
            register={register}
            label="City"
            name="city"
            type="text"
            errors={errors}
            watch={watch}
          />
        </div>
        <div className="col-12 col-md-6">
          <Input
            register={register}
            label="Address"
            name="address"
            type="text"
            errors={errors}
            watch={watch}
          />
        </div>
      </div>
      {offices && offices.length > 0 && (
        <div className="row mb-3">
          <div className="col-12">
            <ControlledSelect<OfficeBase>
              name="office"
              label="Offices"
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
