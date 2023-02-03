import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findOnlyHotel(id: number) {
  return prisma.hotel.findUnique({
    where: { id },
    include: {
      Rooms: true,
    }
  }
  );
}

const hotelsRepository = {
  findHotels, findOnlyHotel
};

export default hotelsRepository;
