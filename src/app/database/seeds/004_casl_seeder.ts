import type { Knex } from "knex";
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
  // 1. Hapus semua data dari tabel yang ada
  await knex('useracl').del();
  await knex('userrole').del();
  await knex('acl').del();
  await knex('users').del();
  await knex('role').del();
  await knex('acos').del();

  // 2. Insert data ke tabel 'acos'
  await knex('acos').insert([
    { id: 1, class: 'User', method: 'GET', nama: 'View Users', modifiedby: 'system' },
    { id: 2, class: 'User', method: 'POST', nama: 'Create User', modifiedby: 'system' },
    { id: 3, class: 'User', method: 'DELETE', nama: 'Delete User', modifiedby: 'system' },
  ]);

  // 3. Insert data ke tabel 'role'
  await knex('role').insert([
    { id: 1, rolename: 'admin', modifiedby: 'system' },
    { id: 2, rolename: 'member', modifiedby: 'system' },
  ]);

  const hashedPassword = await bcrypt.hash('password', 10);

  await knex('users').insert([
    { id: 1, username: 'admin', name: 'Administrator', password: hashedPassword, email: 'admin@example.com', modifiedby: 'system' },
    { id: 2, username: 'member', name: 'Member User', password: hashedPassword, email: 'member@example.com', modifiedby: 'system' },
  ]);

  // 5. Insert data ke tabel 'acl'
  await knex('acl').insert([
    { id: 1, aco_id: 1, role_id: 1, modifiedby: 'system' },  // Admin can view users
    { id: 2, aco_id: 2, role_id: 1, modifiedby: 'system' },  // Admin can create users
    { id: 3, aco_id: 3, role_id: 1, modifiedby: 'system' },  // Admin can delete users
    { id: 4, aco_id: 1, role_id: 2, modifiedby: 'system' },  // Member can view users
  ]);

  // 6. Insert data ke tabel 'userrole'
  await knex('userrole').insert([
    { id: 1, user_id: 1, role_id: 1, modifiedby: 'system' }, // Admin role
    { id: 2, user_id: 2, role_id: 2, modifiedby: 'system' }, // Member role
  ]);

  // 7. Insert data ke tabel 'useracl'
  await knex('useracl').insert([
    { id: 1, aco_id: 1, user_id: 1, modifiedby: 'system' },  // Admin has access to view users
    { id: 2, aco_id: 2, user_id: 1, modifiedby: 'system' },  // Admin has access to create users
    { id: 3, aco_id: 3, user_id: 1, modifiedby: 'system' },  // Admin has access to delete users
    { id: 4, aco_id: 1, user_id: 2, modifiedby: 'system' },  // Member can view users
  ]);
}
