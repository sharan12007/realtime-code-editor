import { Router } from 'express';
import {
  createRoomController,
  deleteRoomController,
  getRoomByCodeController,
  getRoomController,
  listRoomsController
} from '../../../controllers/rooms/room.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';

export const roomRouter = Router();

roomRouter.use(requireAuth);
roomRouter.get('/', asyncHandler(listRoomsController));
roomRouter.post('/', asyncHandler(createRoomController));
roomRouter.get('/code/:code', asyncHandler(getRoomByCodeController));
roomRouter.get('/:id', asyncHandler(getRoomController));
roomRouter.delete('/:id', asyncHandler(deleteRoomController));
