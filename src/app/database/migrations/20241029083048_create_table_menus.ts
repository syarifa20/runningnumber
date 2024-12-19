import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('menus', (table) => {
        table.increments('id').primary(); // Unique identifier
        table.string('title').notNullable(); // Menu item title
        table.bigInteger('aco_id').unsigned().references('id').inTable('acos').nullable(); // Foreign key reference to acos
        table.string('icon'); // Icon representation (optional)
        table.boolean('isActive').defaultTo(true); // Indicates if the menu item is active
        table.integer('parentId').unsigned().references('id').inTable('menus').nullable(); // Parent menu item reference
        table.integer('order').unsigned(); // Order for sorting (optional)
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('menus'); // Drop the menus table if it exists
}
