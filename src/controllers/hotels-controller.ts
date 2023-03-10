/* eslint-disable no-empty */
import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import hotelsService from "@/services/hotels-service";

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const allHotels = await hotelsService.getHotels(userId);

    return res.status(httpStatus.OK).send(allHotels);
  } catch (err) {
    if (err.name === "ConflictError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
    if (err.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  try {
    const onlyHotel = await hotelsService.getHotelById(Number(hotelId));

    return res.status(httpStatus.OK).send(onlyHotel);
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
