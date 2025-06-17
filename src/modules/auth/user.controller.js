import { HTTPSTATUS } from '../configs/http.config.js';
import AsyncHandler from '../middlewares/asyncHandler.js';
import { getUserByIdService } from './services/get-user-by-Id.service.js';

export const getUserByIdController = AsyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const user = await getUserByIdService(id);

  if (!user) {
    return res.status(HTTPSTATUS.NOT_FOUND).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.status(HTTPSTATUS.OK).json({
    success: true,
    message: 'User fetched successfully',
    data: user,
  });
});
