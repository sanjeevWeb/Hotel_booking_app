import { useAppContext } from "../contexts/AppContext";
import * as apiClient from "../api-client";
import { useMutation } from "@tanstack/react-query";
import ManageHotelForm from "../forms/manageHotelForm/ManageHotelForm";

const AddHotel = () => {
  const { showToast } = useAppContext();

  const { mutate, isLoading }: any = useMutation({
    mutationFn: apiClient.addMyHotel,
    onSuccess: () => {
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
    },
    onError: () => {
      showToast({ message: "Error Saving Hotel", type: "ERROR" });
    },
  });

  const handleSave = (hotelFormData: FormData) => {
    mutate(hotelFormData);
  };

  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;