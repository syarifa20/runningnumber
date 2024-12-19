import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Table for acos
    await knex.schema.createTable('acos', (table) => {
        table.bigIncrements('id').primary();
        table.string('class', 50).nullable();
        table.string('method', 50).nullable();
        table.string('nama', 150).nullable();
        table.string('modifiedby', 50).nullable();
        table.integer('idheader').nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Table for roles (since acl references role)
    await knex.schema.createTable('role', (table) => {
        table.bigIncrements('id').primary();
        table.string('rolename', 50).nullable();
        table.string('modifiedby', 50).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Table for acl (which references acos and role)
    await knex.schema.createTable('acl', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('aco_id').unsigned().references('id').inTable('acos').onDelete('CASCADE');
        table.bigInteger('role_id').unsigned().references('id').inTable('role').onDelete('CASCADE');
        table.string('modifiedby', 50).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Table for users
    await knex.schema.createTable('users', (table) => {
        table.bigIncrements('id').primary();
        table.string('username', 255).nullable();
        table.string('name', 255).nullable();
        table.string('password', 255).nullable();
        table.string('email', 255).nullable();
        table.string('modifiedby', 255).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Table for user roles
    await knex.schema.createTable('userrole', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.bigInteger('role_id').unsigned().references('id').inTable('role').onDelete('CASCADE');
        table.string('modifiedby', 50).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });

    // Table for user ACL
    await knex.schema.createTable('useracl', (table) => {
        table.bigIncrements('id').primary();
        table.bigInteger('aco_id').unsigned().references('id').inTable('acos').onDelete('CASCADE');
        table.bigInteger('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('modifiedby', 50).nullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('useracl');
    await knex.schema.dropTableIfExists('userrole');
    await knex.schema.dropTableIfExists('acl');
    await knex.schema.dropTableIfExists('acos');
    await knex.schema.dropTableIfExists('role');
    await knex.schema.dropTableIfExists('users');
}
