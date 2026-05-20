export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  company?: string;
}

export const ROLE_BADGE: Record<string, string> = {
  admin:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  owner:     'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  user:      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  moderator: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  guest:     'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};
