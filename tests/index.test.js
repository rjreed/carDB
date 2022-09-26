/* global expect beforeAll afterAll */

// LIBRARIES

/// node/core libs
const fs = require('fs')
const fsp = require('fs').promises
const path = require('path');

/// vendor libs
const fse = require('fs-extra');
const rimraf = require('rimraf')

/// app/local libs
const carDB = require('../index.js');


// APP

/// Paths and directory names
const fixtures_path = path.join(__dirname, '/fixtures/');
const tables_path = path.join(fixtures_path, '/tables/');
const static_path = path.resolve(fixtures_path, 'static/');

const table_1 = "posts"
const table_2 = "authors"
const table_3 = "users"

const table_1_path = path.join(tables_path, table_1);
const table_2_path = path.join(tables_path, table_2);
const table_3_path = path.join(tables_path, table_3);


/// Data fixtures 
//// TODO move this out and rename/ reorganize

const data_1 = {
  "title": "mauris sit amet",
  "author": "Basia Neal",
  "date": "Nov 27, 2022"
};
const data_2 = {
  "title": "sociosqu ad litora",
  "author": "Steven Burks",
  "date": "Nov 8, 2021"
}
const data_3 = {
  "title": "erat. Vivamus nisi.",
  "author": "Aline Love",
  "date": "Nov 12, 2022"
}

const data_3_update_1 = {
  "date": "Nov 14, 2022"
}

const data_3_2 = {
  "title": "erat. Vivamus nisi.",
  "author": "Aline Love",
  "date": "Nov 14, 2022",
}

const data_3_update_2 = {
  "coauthor": "Ben Bates"
}

const data_3_3 = {
  "title": "erat. Vivamus nisi.",
  "author": "Aline Love",
  "date": "Nov 14, 2022",
  "coauthor": "Ben Bates"
}

const data_4 = {
  "name": "Aline Love",
  "email": "alinelove@gmail.com",
  "group": "1"
}

const data_5 = {
  "name": "Ben Bates",
  "email": "ben.bates@gmail.com",
  "group": "2"
}

const data_6 = {
  "name": "Basia Neal",
  "email": "basiag.neal@gmail.com",
  "group": "2"
}

const data_7 = [data_4, data_5, data_6];


/// Tests

test(`Test environment variables are setup`, () => {
  expect(process.env.NODE_ENV).toBe('test')
  expect(carDB._store).toBe(fixtures_path);
});

test(`carDB.list_tables returns an array of the table names`, async () => {

  const expected_array = [table_1, table_2];
  const recieved_array = await carDB.list_tables();

  expect(recieved_array.length).toEqual(expected_array.length);

  expect(recieved_array).toEqual(expect.arrayContaining(recieved_array));
});

test(`carDB.create_table creates a table`, async () => {
  await carDB.create_table(table_3)

  const stat = await fsp.stat(path.join(tables_path, table_3));
  const _tables = await carDB.list_tables();

  expect(stat.isDirectory()).toBe(true);

  expect(_tables).toContain(table_3);
});

test(`carDB.create_table rejects if given a duplicate table name`, async () => {
  const create_call = carDB.create_table(table_1)

  expect(create_call).rejects.toThrow();;
});

test(`carDB.insert inserts an object into new row`, async () => {
  await carDB.insert(table_1, 2, data_2)


  const retrieved_row = await carDB.get_row(table_1, 2);

  expect(retrieved_row).toEqual(data_2);
});


test(`carDB.insert rejects if given a duplicate row id`, async () => {
  const insert_call = carDB.insert(table_1, 1, data_1)

  expect(insert_call).rejects.toThrow();;
});




test(`carDB.update modifies a key value pair in a row`, async () => {
  await carDB.update(table_1, 1, data_3_update_1)

  const retrieved_row = await carDB.get_row(table_1, 1);

  expect(retrieved_row).toEqual(data_3_2);
});

test(`carDB.update can add a new key-value pair`, async () => {
  await carDB.update(table_1, 1, data_3_update_2)

  const retrieved_row = await carDB.get_row(table_1, 1);

  expect(retrieved_row).toEqual(data_3_3);
});

test(`carDB.get_row returns a row's data`, async () => {
  const retrieved_row = await carDB.get_row(table_1, 2)

  expect(retrieved_row).toEqual(data_2);
});

test(`carDB.get_all returns all of a table's data`, async () => {
  const retrieved_row = await carDB.get_all(table_2)

  expect(retrieved_row).toEqual(data_7);
});

test(`carDB.get_all rejects with an error if given an incorrect table name`, async () => {
  const retrieved_row = carDB.get_all('incorrect_table')

  expect(retrieved_row).rejects.toThrow();
});

test(`carDB.delete_row deletes a row directory/file`, async () => {
  await carDB.delete_row(table_1, 3)

  const exists = await fse.pathExists(path.resolve(table_1_path, '3/'))

  expect(exists).toBe(false);
});

test(`carDB.filter return rows containing a given key-value pair`, async () => {
  const retrieved_row = await carDB.filter(table_2, "group", "2")

  expect(retrieved_row).toEqual([data_5, data_6]);
});


/*
test(`carDB.delete_table deletes a table's directories/files`, async () => {
  await carDB.delete_table(table_3)

  const exists = await fse.pathExists(path.resolve(table_3_path,))

  expect(exists).toBe(false);
});
*/


/// Teardown and Setup

//// delete all the test fixtures
afterAll(() => {
  return new Promise(resolve => {
    rimraf(tables_path, resolve)
  });
});

//// copy the static fixtures over to the tables path
afterAll(() => {

  fse.copy(static_path, tables_path)



});
