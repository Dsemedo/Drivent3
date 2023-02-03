/* eslint-disable no-empty */
import { AuthenticatedRequest } from "@/middlewares";
import { Response, Request } from "express"; 
import httpStatus from "http-status";
import hotelsService from "@/services/hotels-service";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  try{
    const allHotels = await hotelsService.getHotels();

    return res.status(httpStatus.OK).send(allHotels);
  }catch(err) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;  
  try{
    const onlyHotel = await hotelsService.getHotelById(Number(id));

    return res.status(httpStatus.OK).send(onlyHotel);
  } catch(err) {
    return res.status(httpStatus.NOT_FOUND);
  }
}
