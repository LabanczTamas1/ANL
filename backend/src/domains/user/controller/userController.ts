// ---------------------------------------------------------------------------
// User Controller — profile, user management
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRedisClient } from '../../../config/database.js';
import { listAllUsers } from '../../../utils/listAllUsers.js';
import { createLogger, logError } from '../../../utils/logger.js';

const logger = createLogger('user', 'controller');

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const userData = await redisClient.hGetAll(`user:${req.user!.id}`);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      userId: req.user!.id,
      username: userData.username || userData.email,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: userData.role || req.user!.role || 'user',
    });
  } catch (err) {
    logError(err, { context: 'getMe' });
    res.status(500).json({ error: 'Server error' });
  }
}

export async function getUserByUsername(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { username } = req.params;
    const user = await redisClient.hGetAll(`user:${username}`);

    if (!user || Object.keys(user).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserRole(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'owner', 'moderator', 'guest'].includes(role)) {
      res.status(400).json({
        error:
          'Invalid role. Allowed roles are: admin, user, owner, moderator, guest',
      });
      return;
    }

    const userKey = `user:${userId}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await redisClient.hSet(userKey, 'role', role);

    logger.info({ userId, role }, 'User role updated');

    res.status(200).json({
      message: `User role updated successfully to ${role}`,
      user: { id: userId, email: userData.email, name: userData.name, role },
    });
  } catch (error) {
    logError(error, { context: 'updateUserRole' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllUsers(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const users = await listAllUsers();
    res.status(200).json(users);
  } catch (error) {
    logError(error, { context: 'getAllUsers' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addUser(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, email, username, company } = req.body;

    if (!firstName || !lastName || !email || !username) {
      res.status(400).json({
        error: 'firstName, lastName, email, and username are required',
      });
      return;
    }

    const userExists = await redisClient.exists(`user:email:${email}`);
    if (userExists) {
      res
        .status(409)
        .json({ error: 'User already exists with this email' });
      return;
    }

    const userId = uuidv4();

    await redisClient.hSet(`user:${userId}`, {
      id: userId,
      email,
      firstName,
      lastName,
      username,
      company: company || '',
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    await redisClient.set(`user:email:${email}`, userId);
    await redisClient.set(`user:username:${username}`, userId);

    logger.info({ userId, email }, 'User created');

    res.status(201).json({
      message: 'User created successfully',
      userId,
      user: { id: userId, email, firstName, lastName, username, company },
    });
  } catch (error) {
    logError(error, { context: 'addUser' });
    res.status(500).json({ error: 'Failed to add user' });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const userData = await redisClient.hGetAll(`user:${req.user!.id}`);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: req.user!.id,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      username: userData.username || '',
      company: userData.company || '',
      role: userData.role || 'user',
    });
  } catch (error) {
    logError(error, { context: 'getProfile' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, phoneNumber, company, profileImg } = req.body;

    const userKey = `user:${req.user!.id}`;
    const userData = await redisClient.hGetAll(userKey);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedData: Record<string, string> = {};
    if (firstName !== undefined) updatedData.firstName = firstName;
    if (lastName !== undefined) updatedData.lastName = lastName;
    if (phoneNumber !== undefined) updatedData.phoneNumber = phoneNumber;
    if (company !== undefined) updatedData.company = company;
    if (profileImg !== undefined) updatedData.profileImg = profileImg;

    await redisClient.hSet(userKey, updatedData);
    const updated = await redisClient.hGetAll(userKey);

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: req.user!.id,
        email: updated.email,
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        username: updated.username || '',
        phoneNumber: updated.phoneNumber || '',
        company: updated.company || '',
        profileImg: updated.profileImg || '',
      },
    });
  } catch (error) {
    logError(error, { context: 'updateProfile' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { userId } = req.params;
    const userData = await redisClient.hGetAll(`user:${userId}`);

    if (!userData || Object.keys(userData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: userId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      username: userData.username || '',
      company: userData.company || '',
      role: userData.role || 'user',
    });
  } catch (error) {
    logError(error, { context: 'getUserById' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function modifyUserData(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    const { firstName, lastName, email, username, company, country, state, city } =
      req.body;

    const userKey = `user:${req.user!.id}`;
    const currentUserData = await redisClient.hGetAll(userKey);

    if (!currentUserData || Object.keys(currentUserData).length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedData: Record<string, string> = {};
    if (firstName) updatedData.firstName = firstName;
    if (lastName) updatedData.lastName = lastName;
    if (email) updatedData.email = email;
    if (username) updatedData.username = username;
    if (company) updatedData.company = company;
    if (country) updatedData.country = country;
    if (state) updatedData.state = state;
    if (city) updatedData.city = city;

    if (Object.keys(updatedData).length === 0) {
      res.status(400).json({ error: 'No data provided to update' });
      return;
    }

    await redisClient.hSet(userKey, updatedData);
    const updated = await redisClient.hGetAll(userKey);

    res.status(200).json({
      message: 'User data modified successfully',
      user: {
        id: req.user!.id,
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        email: updated.email || '',
        username: updated.username || '',
        company: updated.company || '',
        country: updated.country || '',
        state: updated.state || '',
        city: updated.city || '',
      },
    });
  } catch (error) {
    logError(error, { context: 'modifyUserData' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
