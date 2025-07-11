import Client from '../src/client';

const TABLE = 'node_mysql_test';

const client = new Client({
  host: 'localhost',
  port: 3306,
  database: 'test',
  user: 'root',
  password: '123456',
  charset: 'UTF8MB4_GENERAL_CI',
});

it('table data init', async () => {
  // initialize data
  await client.insert({
    table: TABLE,
    value: [
      { name: 'tom', age: 17, status: 1 },
      { name: 'tim', age: 17, status: 1 },
      { name: 'jerry', age: 18, status: 0 },
      { name: 'james', age: 17, status: 1 },
      { name: 'james', age: 20, status: 0 },
      { name: 'kate', age: 25, status: 1 },
      { name: 'harden', age: 17, status: 1 },
      { name: 'harden', age: 20, status: 1 },
      { name: 'harden', age: 40, status: 0 },
      { name: 'timo', age: 48, status: 0 },
      { name: 'yasuo', age: 77, status: 1 },
      { name: 'akl', age: 50, status: 1 },
      { name: 'lux', age: 8, status: 1 },
    ],
  });
});

// ****** query test start ******
it('async query without placeholders', async () => {
  const result = await client.query(`SELECT \`name\`, \`age\` FROM \`${TABLE}\` WHERE \`name\` = 'tom';`);
  expect(result).toEqual([{ name: 'tom', age: 17 }]);
});

it('simple async query with placeholders', async () => {
  const result = await client.query(
    `SELECT \`name\`, \`age\` FROM \`${TABLE}\` WHERE \`age\` >= ? AND \`status\` = ?;`,
    [55, 1],
  );
  expect(result).toEqual([{ name: 'yasuo', age: 77 }]);
});
// ****** query test end ******

// ****** get test start ******
it('simple async get', async () => {
  const result = await client.get({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { name: 'kate' },
    },
  });
  expect(result).toEqual({ name: 'kate', age: 25 });
});

it('another simple async get', async () => {
  const result = await client.get({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { name: 'harden' },
    },
  });
  expect(result).toEqual({ name: 'harden', age: 17 });
});

it('simple async get with empty column array', async () => {
  const result = await client.get({
    table: TABLE,
    column: [],
    where: {
      eq: { name: 'tim' },
    },
  });
  expect(result).toEqual({ name: 'tim', age: 17, status: 1, id: 2, msg: 'message' });
});

it('simple async get without column param', async () => {
  const result = await client.get({
    table: TABLE,
    where: {
      eq: { name: 'tim' },
    },
  });
  expect(result).toEqual({ name: 'tim', age: 17, status: 1, id: 2, msg: 'message' });
});

// ****** select test start ******
it('simple async select', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { name: 'kate' },
    },
  });
  expect(result).toEqual([{ name: 'kate', age: 25 }]);
});

it('simple async select with non-existent id', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { id: 100 },
    },
  });
  expect(result).toEqual([]);
});

it('async select with empty column array', async () => {
  const result = await client.select({
    table: TABLE,
    column: [],
    where: {
      eq: { name: 'tim' },
    },
  });
  expect(result).toEqual([
    {
      id: 2,
      name: 'tim',
      age: 17,
      status: 1,
      msg: 'message',
    },
  ]);
});

it('async select without column param', async () => {
  const result = await client.select({
    table: TABLE,
    where: {
      eq: { name: 'tim' },
    },
  });
  expect(result).toEqual([
    {
      id: 2,
      name: 'tim',
      age: 17,
      status: 1,
      msg: 'message',
    },
  ]);
});

it('async select without where param', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    limit: 2,
  });
  expect(result).toEqual([
    { name: 'tom', age: 17 },
    { name: 'tim', age: 17 },
  ]);
});

it('async select with limit and offset params', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { status: 1 },
    },
    limit: 3,
    offset: 1,
  });
  expect(result).toEqual([
    { name: 'tim', age: 17 },
    { name: 'james', age: 17 },
    { name: 'kate', age: 25 },
  ]);
});

it('async select with order params', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { status: 1 },
      le: { id: 5 },
    },
    limit: 3,
    order: { id: 'desc' },
  });
  expect(result).toEqual([
    { name: 'james', age: 17 },
    { name: 'tim', age: 17 },
    { name: 'tom', age: 17 },
  ]);
});

it('async select with complex where options', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['id', 'name', 'age', 'status'],
    where: {
      eq: { status: 1, name: 'harden' },
      gt: { id: 5 },
      bw: { age: [7, 30] },
      ni: { age: [17] },
    },
  });
  expect(result).toEqual([{ id: 8, name: 'harden', age: 20, status: 1 }]);
});

it('async select with where simple or options', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      eq: { status: 1 },
      le: { age: 20 },
      or: [{ eq: { name: 'harden' } }, { eq: { name: 'tim' } }],
    },
    limit: 10,
  });
  expect(result).toEqual([
    { name: 'tim', age: 17 },
    { name: 'harden', age: 17 },
    { name: 'harden', age: 20 },
  ]);
});

it('async select with where complex or options', async () => {
  const result = await client.select({
    table: TABLE,
    column: ['name', 'age'],
    where: {
      or: [{ eq: { name: 'harden', status: 0 }, le: { age: 30 } }, { eq: { name: 'tim' } }],
    },
    limit: 10,
  });
  expect(result).toEqual([{ name: 'tim', age: 17 }]);
});
// ****** select test end ******

// ****** insert test start ******
it('async single insert', async () => {
  const result = await client.insert({
    table: TABLE,
    value: {
      name: 'lulu',
      age: 87,
      status: 0,
    },
  });
  expect(result.affectedRows).toEqual(1);
});

it('async multi insert', async () => {
  const result = await client.insert({
    table: TABLE,
    value: [
      {
        name: 'vn',
        age: '21',
        status: 1,
      },
      {
        name: 'qin',
        age: '24',
        status: 1,
      },
      {
        name: 'lee',
        age: '26',
        status: 0,
      },
    ],
  });
  expect(result.affectedRows).toEqual(3);
});
// ****** insert test end ******

// ****** update test start ******
it('async update', async () => {
  const result = await client.update({
    table: TABLE,
    value: { msg: 'update timo message' },
    where: {
      eq: { name: 'timo' },
    },
  });
  expect(result.affectedRows).toEqual(1);
});

it('async update without empty value param', async () => {
  try {
    await client.update({
      table: TABLE,
      value: {},
      where: {
        eq: { name: 'timo' },
      },
    });
  } catch (e) {
    expect((e as Error).message).toEqual(`update's value should be a non-empty plain object!`);
  }
});
// ****** update test end ******

// ****** delete test start ******
it('async delete', async () => {
  const result = await client.delete({
    table: TABLE,
    where: {
      eq: { name: 'akl' },
    },
  });
  expect(result.affectedRows).toEqual(1);
});
// ****** delete test end ******

// ****** count test start ******
it('async count', async () => {
  const result = await client.count({
    table: TABLE,
    where: {
      eq: { status: 1 },
    },
  });
  expect(result).toEqual(10);
});
// ****** count test end ******

// ****** transaction test start ******
it('async transaction success', async () => {
  const tran = await client.beginTransaction();
  try {
    const res = await tran.select({
      table: TABLE,
      column: ['id', 'age'],
      where: { eq: { name: 'lux' } },
    });
    expect(res).toEqual([{ id: 13, age: 8 }]);
    const res1 = await tran.update({
      table: TABLE,
      value: { msg: 'update lux message' },
      where: { eq: { id: res[0].id } },
    });
    expect(res1.affectedRows).toEqual(1);
    await tran.commit();
  } catch (e) {
    await tran.rollback();
  }
});

it('async transaction error', async () => {
  const tran = await client.beginTransaction();
  try {
    const res = await tran.select({
      table: TABLE,
      column: ['id', 'age'],
      where: { eq: { name: 'lux' } },
    });
    expect(res).toEqual([{ id: 13, age: 8 }]);
    const res1 = await tran.update({
      table: TABLE,
      value: { msg: 'update lux message' },
      where: { eq: { ids: res[0].id } },
    });
    expect(res1.affectedRows).toEqual(1);
    await tran.commit();
  } catch (e) {
    await tran.rollback();
    // expect((e as Error).message).toEqual(`Unknown column 'ids' in 'where clause'`);
    expect((e as Error).message).toEqual(`ER_BAD_FIELD_ERROR: Unknown column 'ids' in 'where clause'`);
  }
});
// ****** transaction test end ******

// ****** auto transaction test start ******
it('async auto transaction', async () => {
  const result = await client.autoTransaction(async tran => {
    const res = await tran.select({
      table: TABLE,
      column: ['id', 'age'],
      where: { eq: { name: 'lux' } },
    });
    expect(res).toEqual([{ id: 13, age: 8 }]);
    const res1 = await tran.update({
      table: TABLE,
      value: { msg: 'update lux message wohhhhh' },
      where: { eq: { id: res[0].id } },
    });
    expect(res1.affectedRows).toEqual(1);
    const result = await tran.insert({
      table: TABLE,
      value: {
        name: 'xin',
        age: 66,
      },
    });
    return result;
  });
  expect((result as { affectedRows: number }).affectedRows).toEqual(1);
});

it('async auto transaction error', async () => {
  try {
    const result = await client.autoTransaction(async tran => {
      const res = await tran.select({
        table: TABLE,
        column: ['id', 'age'],
        where: { eq: { name: 'lux' } },
      });
      expect(res).toEqual([{ id: 13, age: 8 }]);
      const res1 = await tran.update({
        table: TABLE,
        value: { msg: 'update lux message wohhhhh error' },
        where: { eq: { ids: res[0].id } },
      });
      expect(res1.affectedRows).toEqual(1);
      const result = await tran.insert({
        table: TABLE,
        value: {
          name: 'kenxi',
          age: 4,
        },
      });
      return result;
    });
    expect((result as { affectedRows: number }).affectedRows).toEqual(1);
  } catch (e) {
    expect((e as Error).message).toEqual(`ER_BAD_FIELD_ERROR: Unknown column 'ids' in 'where clause'`);
  }
});
// ****** auto transaction test end ******

// ****** literal test start ******
it('use literal', async () => {
  await client.update({
    table: TABLE,
    value: {
      name: client.literal("concat('tom', ' and ', 'jerry')"),
      msg: 'now()',
    },
    where: {
      eq: { age: 17, id: 2 },
    },
  });
  const result = await client.select({
    table: TABLE,
    column: ['name', 'msg'],
    where: {
      eq: { id: 2 },
    },
  });
  expect(result).toEqual([{ name: 'tom and jerry', msg: 'now()' }]);
});
// ****** literal test end ******

it('disconnect', async () => {
  // this test function make no sense, just for us to finish the test successfully
  // note: disconnect must be called at the last!!
  (await client.pool).end();
});
