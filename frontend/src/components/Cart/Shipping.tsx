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
import MailIcon from "@mui/icons-material/Mail";
import { Country, State } from "country-state-city";
import CheckoutSteps from "@/components/Cart/CheckoutSteps";
import { useNavigate } from "react-router-dom";
import FormInput from "@/components/Form/FormInput";
import PersonIcon from "@mui/icons-material/Person";
import FormSelect from "@/components/Form/FormSelect";

const shippingSchema = z.object({
  guestName: z.string().min(1, "Full name is required").optional().or(z.literal('')),
  guestEmail: z.string().email("Valid email address is required").optional().or(z.literal('')),
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
  const { isAuthenticated, user } = useAppSelector((state) => state.user);

  const storedGuestName = localStorage.getItem("guestName") || "";
  const storedGuestEmail = localStorage.getItem("guestEmail") || "";

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema) as any,
    defaultValues: {
      guestName: isAuthenticated ? user?.name : storedGuestName,
      guestEmail: isAuthenticated ? user?.email : storedGuestEmail,
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
    if (!isAuthenticated) {
      if (!data.guestName || data.guestName.trim().length === 0) {
        setError("guestName", { message: "Full name is required for guest checkout" });
        return;
      }
      if (!data.guestEmail || !data.guestEmail.includes("@")) {
        setError("guestEmail", { message: "Email address is required for guest checkout" });
        return;
      }
      localStorage.setItem("guestName", data.guestName);
      localStorage.setItem("guestEmail", data.guestEmail);
    }

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
            {!isAuthenticated && (
              <>
                <FormInput
                  icon={<PersonIcon />}
                  type="text"
                  label="Full Name"
                  register={register("guestName")}
                  error={errors.guestName}
                />
                <FormInput
                  icon={<MailIcon />}
                  type="email"
                  label="Email Address (for Receipt & Tracking)"
                  register={register("guestEmail")}
                  error={errors.guestEmail}
                />
              </>
            )}

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
            />

            <FormSelect
              icon={<PublicIcon />}
              label="Country"
              value={selectedCountry || ""}
              onChange={(e: any) => {
                setValue("country", e.target.value);
                setValue("state", "");
              }}
              options={Country.getAllCountries().map((item) => ({
                value: item.isoCode,
                label: item.name,
              }))}
              error={errors.country}
            />

            {selectedCountry && (
              <FormSelect
                icon={<TransferWithinAStationIcon />}
                label="State"
                value={selectedState || ""}
                onChange={(e: any) => setValue("state", e.target.value)}
                options={State.getStatesOfCountry(selectedCountry).map((item) => ({
                  value: item.isoCode,
                  label: item.name,
                }))}
                error={errors.state}
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
