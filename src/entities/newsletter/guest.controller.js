import { catchAsync } from "../../utility/catchAsync.js";
import { guestService } from "./guest.service.js";
import { sendResponse } from "../../utility/sendResponse.js";

const guestSubscriber = catchAsync(async (req, res) => {
  const guest = await guestService.createGuestSubscriberIntoDb(req.body.email);

  sendResponse(res, {
    statusCode: 201,
    message: 'Subscribed successfully',
    data: guest,
  });
});

const getAllGuests = catchAsync(async (req, res) => {
  const result = await guestService.getAllGuestsFromDb(req.query);

  sendResponse(res, {
    statusCode: 200,
    message: "Subscribers fetched successfully",
    data: result.items,
    meta: result.meta,
  });
});

const deleteGuest = catchAsync(async (req, res) => {
  const deleted = await guestService.deleteGuestFromDb(req.params.id);

  sendResponse(res, {
    statusCode: 200,
    message: "Subscriber deleted successfully",
    data: deleted,
  });
});

export const guestController = {
    guestSubscriber,
    getAllGuests,
    deleteGuest

}
