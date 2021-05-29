import * as SQLite from 'expo-sqlite'
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { PartColorData } from '../types';

const selectColors = `SELECT * FROM colors WHERE id = ? ;`;
const databaseFile = '../assets/rebrickable.db';
let database: SQLite.WebSQLDatabase;

export type ColorData = {
    id: number,
    name: string,
    rgb: string,
    is_trans: string,
  };

export async function openDatabase(pathToDatabaseFile: string): Promise<SQLite.WebSQLDatabase> {
    if (!(await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'SQLite')).exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'SQLite');
    }
    await FileSystem.downloadAsync(
        Asset.fromModule(pathToDatabaseFile).uri,
        FileSystem.documentDirectory + 'SQLite/temp.db'
    );
    database = SQLite.openDatabase('temp.db');

    return database;
}

export function getColorData(db: SQLite.WebSQLDatabase, id: number) {
    return () => new Promise<ColorData>((resolve, reject) => {
        db.readTransaction(tx => tx.executeSql(selectColors, [id], (_, results) => {
            if(results.rows.length > 0)
            {
                resolve(results.rows.item(0) as ColorData)
            }
        }),
            (err) => {
                reject(err); console.log("err: ", err);
            },
            () => {/*resolve();*/ return false })
    })
}

export function updateRGBData(colorData: PartColorData[]) {
    return new Promise((resolve, reject) => {
        openDatabase(require(databaseFile)).then((db) => {
            var cnt = 0;
            colorData.forEach(
                (colorEntry) => {
                    getColorData(db, colorEntry.color_id)().then(
                        (value) => {
                            colorEntry.rgb = value.rgb;
                            colorEntry.is_trans = value.is_trans === "t";
                            cnt++;
                            if (cnt == colorData.length) {

                                resolve(null);
                            }
                        }, 
                        (err) => {
                            console.error(err); cnt++;
                            if (cnt == colorData.length) {
                                reject(err);
                            }
                        })
                }
            )
        }
        )
    })
}