import { conflictError, notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw notFoundError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) {
    throw notFoundError();
  }
  const { TicketType } = await ticketRepository.findTickeWithTypeById(ticket.id);
  if(TicketType.isRemote || ticket.status === "RESERVED") {
    throw conflictError("You don't have permission for this");
  }  
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
