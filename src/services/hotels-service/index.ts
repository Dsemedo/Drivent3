import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotels() {
  const hotels = await hotelsRepository.findHotels();
  
  if(!hotels) {
    throw notFoundError();
  }

  return hotels;
}

async function getHotelById(id: number) {
  const hotel = await hotelsRepository.findOnlyHotel(id);

  if(!hotel) {
    throw notFoundError();
  }

  return hotel;
}

const hotelsService = {
  getHotelById,
  getHotels
};

export default hotelsService;
