// ---------------------------------------------------------------------------
// User Controller — profile, user management
// ---------------------------------------------------------------------------

import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, logError } from '../../../utils/logger.js';
import {
  notifyRoleChanged,
  notifyProfileUpdated,
} from '../../../utils/systemNotifications.js';
import * as userRepo from '../repository/userRepository.js';

const logger = createLogger('user', 'controller');

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await userRepo.findById(req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      userId: user.id,
      username: user.username || user.email,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role || req.user!.role || 'user',
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
    const { username } = req.params;
    const user = await userRepo.findByUsername(username);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(userRepo.toApiUser(user));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUserRole(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'user', 'owner', 'moderator', 'guest'].includes(role)) {
      res.status(400).json({
        error:
          'Invalid role. Allowed roles are: admin, user, owner, moderator, guest',
      });
      return;
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updated = await userRepo.updateUser(userId, { role });

    await notifyRoleChanged(
      userId,
      user.first_name || user.username || 'there',
      role,
    );

    logger.info({ userId, role }, 'User role updated');

    res.status(200).json({
      message: `User role updated successfully to ${role}`,
      user: {
        id: userId,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`.trim(),
        role,
      },
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
    const users = await userRepo.findAll();
    res.status(200).json(users.map(userRepo.toApiUser));
  } catch (error) {
    logError(error, { context: 'getAllUsers' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function addUser(req: Request, res: Response): Promise<void> {
  try {
    const { firstName, lastName, email, username, company } = req.body;

    if (!firstName || !lastName || !email || !username) {
      res.status(400).json({
        error: 'firstName, lastName, email, and username are required',
      });
      return;
    }

    if (await userRepo.emailExists(email)) {
      res
        .status(409)
        .json({ error: 'User already exists with this email' });
      return;
    }

    const userId = uuidv4();

    await userRepo.createUser({
      id: userId,
      email,
      firstName,
      lastName,
      username,
      company: company || '',
      role: 'user',
    });

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
    const user = await userRepo.findById(req.user!.id);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      username: user.username || '',
      company: user.company || '',
      role: user.role || 'user',
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
    const { firstName, lastName, phoneNumber, company, profileImg } = req.body;

    const user = await userRepo.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (firstName !== undefined) updates.firstName = firstName;
    if (lastName !== undefined) updates.lastName = lastName;
    if (phoneNumber !== undefined) updates.phone = phoneNumber;
    if (company !== undefined) updates.company = company;
    if (profileImg !== undefined) updates.profilePicture = profileImg;

    const updated = await userRepo.updateUser(req.user!.id, updates);

    // Notify only for fields that actually changed
    const fieldLabels: Record<string, string> = {
      firstName: 'First name',
      lastName: 'Last name',
      phone: 'Phone number',
      company: 'Company',
      profilePicture: 'Profile image',
    };
    const changedFields = Object.keys(updates)
      .filter((k) => {
        const col = k === 'firstName' ? 'first_name' : k === 'lastName' ? 'last_name' : k === 'profilePicture' ? 'profile_picture' : k;
        return (user as any)[col] !== updates[k];
      })
      .map((k) => fieldLabels[k] ?? k);

    if (changedFields.length > 0) {
      await notifyProfileUpdated(
        req.user!.id,
        updated?.first_name || updated?.username || 'there',
        changedFields,
      );
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updated ? userRepo.toApiUser(updated) : null,
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
    const { userId } = req.params;
    const user = await userRepo.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      username: user.username || '',
      company: user.company || '',
      role: user.role || 'user',
    });
  } catch (error) {
    logError(error, { context: 'getUserById' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function changePassword(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'currentPassword and newPassword are required' });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    const user = await userRepo.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const storedHash = user.password || '';
    if (!storedHash) {
      res.status(400).json({ error: 'Password change not available for OAuth accounts' });
      return;
    }

    const { default: bcrypt } = await import('bcrypt');
    const isMatch = await bcrypt.compare(currentPassword, storedHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userRepo.updateUser(req.user!.id, { password: newHash });

    logger.info({ userId: req.user!.id }, 'Password changed successfully');
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    logError(error, { context: 'changePassword' });
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function modifyUserData(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { firstName, lastName, email, username, company } = req.body;

    const user = await userRepo.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updates: Record<string, any> = {};
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    if (email) updates.email = email;
    if (username) updates.username = username;
    if (company) updates.company = company;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No data provided to update' });
      return;
    }

    const updated = await userRepo.updateUser(req.user!.id, updates);

    res.status(200).json({
      message: 'User data modified successfully',
      user: updated ? userRepo.toApiUser(updated) : null,
    });
  } catch (error) {
    logError(error, { context: 'modifyUserData' });
    res.status(500).json({ error: 'Internal server error' });
  }
}
