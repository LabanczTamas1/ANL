import React from 'react';
import { User } from '../types';
import { useLanguage } from '../../../hooks/useLanguage';
import {
  Badge,
  ROLE_TONES,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@design-system/components';

interface Props {
  users: User[];
  onRoleChange: (userId: string, newRole: string) => void;
}

const ROLES = ['admin', 'owner', 'user', 'moderator', 'guest'];

function displayName(u: User) {
  return u.firstName ? `${u.firstName} ${u.lastName}`.trim() : u.username;
}

const UserTable: React.FC<Props> = ({ users, onRoleChange }) => {
  const { t } = useLanguage();
  return (
    <TableContainer>
      <Table>
        <Thead>
          <Tr>
            <Th>{t('admin.colName')}</Th>
            <Th className="hidden md:table-cell">{t('admin.colEmail')}</Th>
            <Th className="hidden lg:table-cell">{t('admin.colCompany')}</Th>
            <Th>{t('admin.colRole')}</Th>
            <Th className="hidden sm:table-cell">{t('admin.colJoined')}</Th>
          </Tr>
        </Thead>
        <Tbody className="divide-y divide-line/50 dark:divide-line-dark/50">
          {users.map(user => (
            <Tr key={user.id} hoverable>
              <Td>
                <div className="font-medium text-content dark:text-content-inverse">
                  {displayName(user)}
                </div>
                <div className="text-xs text-content-muted md:hidden">{user.email}</div>
                <div className="text-xs text-content-muted font-mono truncate max-w-[160px]">
                  {user.id}
                </div>
              </Td>
              <Td className="text-content-subtle dark:text-content-subtle-inverse hidden md:table-cell">
                {user.email}
              </Td>
              <Td className="text-content-muted hidden lg:table-cell">{user.company || '—'}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Badge tone={ROLE_TONES[user.role] ?? 'neutral'}>{user.role}</Badge>
                  <Select
                    selectSize="sm"
                    value={user.role}
                    onChange={e => onRoleChange(user.id, e.target.value)}
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>
              </Td>
              <Td className="text-content-muted hidden sm:table-cell">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
