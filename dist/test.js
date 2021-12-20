const MySQLClient = require('./index1').default;
const isPlainObject = require('lodash').isPlainObject;

const client = new MySQLClient({
  host: '10.188.36.4',
  port: '8002',
  database: 'faq',
  user: 'tom',
  password: '123456',
  // timezone: '+08:00',
  // dateStrings: true,
});

const test = async () => {
  const res = await client.select({
    table: 'issue',
    column: ['issue_id', 'system', 'directory_id', 'issue_title', 'create_time'],
    where: {
      eq: [
        { column: 'directory_id', value: 'eas4e3g1g4vs' },
        { column: 'create_user_id', value: '01412009' },
      ],
      ne: { column: 'create_user_id', value: '01412009' },
      bw: { column: 'create_time', value: [new Date('2021-11-15 17:30:01'), new Date('2021-11-15 17:45:01')] },
      in: { column: 'issue_id', value: [50, 55] },
      or: [
        {
          eq: [
            { column: 'issue_id', value: 50 },
            { column: 'issue_id', value: 55 },
          ],
          ne: { column: 'create_user_id', value: '01412009' },
        },
        { eq: { column: 'issue_id', value: 55 } },
      ],
    },
    order: [['issue_id', 'asc']],
    limit: 2,
  });
  console.log(res);
};

// test();
// console.log(new Date('2021-11-15 11:45:01'));

const where = {
  eq: {
    directory_id: 'eas4e3g1g4vs',
    create_user_id: '01412009',
  },
  ne: { create_user_id: '01412009' },
  bw: { create_time: [new Date('2021-11-15 17:30:01'), new Date('2021-11-15 17:45:01')] },
  in: { issue_id: [50, 55] },
  or: [
    {
      eq: {
        issue_id: 50,
        create_user_id: '01412010',
      },
      ne: { create_user_id: '01412009' },
    },
    { eq: { issue_id: 55 } },
  ],
};
