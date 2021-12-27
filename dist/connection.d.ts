import { PoolConnection } from 'mysql2/promise';
import Query from './query';
export default class Connection extends Query {
    conn: PoolConnection;
    constructor(conn: PoolConnection);
    /**
     * basic query method
     * @param sql (prepared) sql statement
     * @param values values corresponding to placeholders
     * @returns sql execute result
     */
    _query(sql: string, values?: unknown | unknown[] | {
        [param: string]: unknown;
    }): Promise<[import("mysql2/typings/mysql/lib/protocol/packets/OkPacket") | import("mysql2/typings/mysql/lib/protocol/packets/ResultSetHeader") | import("mysql2/typings/mysql/lib/protocol/packets/RowDataPacket")[] | import("mysql2/typings/mysql/lib/protocol/packets/RowDataPacket")[][] | import("mysql2/typings/mysql/lib/protocol/packets/OkPacket")[], import("mysql2/typings/mysql/lib/protocol/packets/FieldPacket")[]]>;
}
