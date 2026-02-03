
import { AppError } from "../../utility/AppError.js";
import { Guest } from "./guest.model.js";
// import  sendEmail from "../../lib/sendEmail.js";

import { notifyAdminGuestSubscribed } from "./guestNotification.service.js";

const createGuestSubscriberIntoDb = async (email) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const isExistEmail = await Guest.findOne({ email });
  if (isExistEmail) {
    throw new AppError('Email already exists', 409, [
      { field: 'email', message: 'This email is already subscribed' },
    ]);
  }

  const guest = await Guest.create({ email });

  // 🔔 Notify admin (side effect)
  notifyAdminGuestSubscribed({ email }).catch((err) => {
    console.error('Admin email notification failed:', err);
  });

  return guest;
};

const getAllGuestsFromDb = async (query) => {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const q = (query.q || "").toString().trim().toLowerCase();
  const status = query.status ? query.status.toString().trim().toUpperCase() : null;
  const tag = query.tag ? query.tag.toString().trim().toLowerCase() : null;

  const filter = {};
  if (q) filter.email = { $regex: q, $options: "i" };
  if (status) filter.status = status;
  if (tag) filter.tags = tag;

  const [items, total] = await Promise.all([
    Guest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Guest.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};


const deleteGuestFromDb = async (id) => {
  const deleted = await Guest.findByIdAndDelete(id).lean();
  if (!deleted) throw new AppError("Subscriber not found", 404);
  return deleted;
};


export const guestService = {
  createGuestSubscriberIntoDb,
  getAllGuestsFromDb,
  deleteGuestFromDb
}