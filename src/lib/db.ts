import mysql from 'mysql2/promise';
import 'server-only';

const pool = mysql.createPool({
    host: "218.255.186.126",
    port: 910,
    user: "mt4user",
    password: "dnadna",
    database: "golday_mt5_uat",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export type RowDataPacket = { [key: string]: any };
export type QueryResult = RowDataPacket[] | RowDataPacket[][] | mysql.OkPacket | mysql.OkPacket[];

// Properly typed query function
export async function query<T extends RowDataPacket[]>(
    sql: string,
    params?: any[]
): Promise<T> {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
}