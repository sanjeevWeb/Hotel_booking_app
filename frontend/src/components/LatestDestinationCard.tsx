import { Link } from "react-router-dom";
import { HotelType } from "../../../backend/src/shared/types";

type Props = {
    hotel: HotelType;
};

const LatestDestinationCard = ({ hotel }: Props) => {
    return (
        <Link
            to={`/detail/${hotel._id}`}
            className="relative cursor-pointer overflow-hidden rounded-md"
        >
            <div className="h-[300px]">
                <img
                    src={hotel.imageUrls[0]}
                    className="w-full h-full object-cover object-center"
                />
            </div>

            <div className="absolute bottom-0 p-4 bg-blue-300 bg-opacity-50 w-full rounded-b-md">
                <span className="text-black font-bold tracking-tight text-2xl">
                    {hotel.name.toUpperCase()}
                </span>
            </div>
        </Link>
    );
};

export default LatestDestinationCard;