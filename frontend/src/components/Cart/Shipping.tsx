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
            <div>
              <HomeIcon />
              <input
                type="text"
                placeholder="Address"
                {...register("address")}
              />
            </div>
            {errors.address && <span className="text-red-500 text-xs mt-1 ml-10">{errors.address.message}</span>}

            <div>
              <LocationCityIcon />
              <input
                type="text"
                placeholder="City"
                {...register("city")}
              />
            </div>
            {errors.city && <span className="text-red-500 text-xs mt-1 ml-10">{errors.city.message}</span>}

            <div>
              <PinDropIcon />
              <input
                type="number"
                placeholder="Pin Code"
                {...register("pinCode")}
              />
            </div>
            {errors.pinCode && <span className="text-red-500 text-xs mt-1 ml-10">{errors.pinCode.message}</span>}

            <div>
              <PhoneIcon />
              <input
                type="number"
                placeholder="Phone Number"
                {...register("phoneNo")}
                maxLength={10}
              />
            </div>
            {errors.phoneNo && <span className="text-red-500 text-xs mt-1 ml-10">{errors.phoneNo.message}</span>}

            <div>
              <PublicIcon />
              <select {...register("country")}>
                <option value="">Country</option>
                {Country &&
                  Country.getAllCountries().map((item) => (
                    <option key={item.isoCode} value={item.isoCode}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </div>
            {errors.country && <span className="text-red-500 text-xs mt-1 ml-10">{errors.country.message}</span>}

            {selectedCountry && (
              <div>
                <TransferWithinAStationIcon />
                <select {...register("state")}>
                  <option value="">State</option>
                  {State &&
                    State.getStatesOfCountry(selectedCountry).map((item) => (
                      <option key={item.isoCode} value={item.isoCode}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
            {errors.state && <span className="text-red-500 text-xs mt-1 ml-10">{errors.state.message}</span>}

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
