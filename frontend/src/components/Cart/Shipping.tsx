import React, { Fragment, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "@/components/Cart/Shipping.css";
import { saveShippingInfo } from "@/features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import MetaData from "@/components/Layout/MetaData";
import PinDropIcon from "@mui/icons-material/PinDrop";
import HomeIcon from "@mui/icons-material/Home";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import PublicIcon from "@mui/icons-material/Public";
import PhoneIcon from "@mui/icons-material/Phone";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import { Country, State } from "country-state-city";
import CheckoutSteps from "@/components/Cart/CheckoutSteps";
import { useNavigate } from "react-router-dom";
import FormInput from "@/components/Form/FormInput";
import FormSelect from "@/components/Form/FormSelect";

const shippingSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  pinCode: z.coerce.number().min(1, "Pin Code is required"),
  phoneNo: z.string().length(10, "Phone Number must be exactly 10 digits"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const Shipping: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { shippingInfo } = useAppSelector((state) => state.cart);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: {
      address: shippingInfo?.address || "",
      city: shippingInfo?.city || "",
      pinCode: shippingInfo?.pinCode ? Number(shippingInfo.pinCode) : 0,
      phoneNo: shippingInfo?.phoneNo ? String(shippingInfo.phoneNo) : "",
      country: shippingInfo?.country || "",
      state: shippingInfo?.state || "",
    },
  });

  const selectedCountry = useWatch({
    control,
    name: "country",
  });

  const selectedState = useWatch({
    control,
    name: "state",
  });

  const onShippingSubmit = (data: ShippingFormValues) => {
    dispatch(
      saveShippingInfo({
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        pinCode: data.pinCode,
        phoneNo: Number(data.phoneNo),
      })
    );
    navigate("/order/confirm");
  };

  useEffect(() => {
    if (shippingInfo) {
      setValue("address", shippingInfo.address);
      setValue("city", shippingInfo.city);
      setValue("pinCode", Number(shippingInfo.pinCode) || 0);
      setValue("phoneNo", String(shippingInfo.phoneNo));
      setValue("country", shippingInfo.country);
      setValue("state", shippingInfo.state);
    }
  }, [shippingInfo, setValue]);

  return (
    <Fragment>
      <MetaData title="Shipping Details" />

      <CheckoutSteps activeStep={0} />

      <div className="shippingContainer">
        <div className="shippingBox">
          <h2 className="shippingHeading">Shipping Details</h2>

          <form
            className="shippingForm"
            encType="multipart/form-data"
            onSubmit={handleSubmit(onShippingSubmit)}
          >
            <FormInput
              icon={<HomeIcon />}
              type="text"
              label="Address"
              register={register("address")}
              error={errors.address}
            />

            <FormInput
              icon={<LocationCityIcon />}
              type="text"
              label="City"
              register={register("city")}
              error={errors.city}
            />

            <FormInput
              icon={<PinDropIcon />}
              type="number"
              label="Pin Code"
              register={register("pinCode")}
              error={errors.pinCode}
            />

            <FormInput
              icon={<PhoneIcon />}
              type="number"
              label="Phone Number"
              register={register("phoneNo")}
              error={errors.phoneNo}
              inputProps={{ maxLength: 10 }}
            />

            <FormSelect
              icon={<PublicIcon />}
              label="Country"
              control={control}
              name="country"
              searchable={true}
              register={register("country")}
              error={errors.country}
              options={Country.getAllCountries().map((item) => ({
                label: item.name,
                value: item.isoCode,
              }))}
            />

            {selectedCountry && (
              <FormSelect
                icon={<TransferWithinAStationIcon />}
                label="State"
                control={control}
                name="state"
                searchable={true}
                register={register("state")}
                error={errors.state}
                options={State.getStatesOfCountry(selectedCountry).map((item) => ({
                  label: item.name,
                  value: item.isoCode,
                }))}
              />
            )}

            <input
              type="submit"
              value="Continue"
              className="shippingBtn"
              disabled={!selectedState}
            />
          </form>
        </div>
      </div>
    </Fragment>
  );
};

export default Shipping;
