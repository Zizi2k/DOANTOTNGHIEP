/*
 * clone-database.js — Tạo database MySQL mới và copy toàn bộ bảng + dữ liệu từ DB cũ.
 *
 * Cách dùng (trong thư mục backend):
 *   node scripts/clone-database.js --from elearning_db --to huynhgia_qlhv
 *
 * Tùy chọn:
 *   --env .env          File env (mặc định: backend/.env)
 *   --from <tên_db_cũ>  Database nguồn (bắt buộc)
 *   --to <tên_db_mới>   Database đích (bắt buộc)
 *   --drop              Xóa DB đích nếu đã tồn tại rồi tạo lại
 *   --update-env        Ghi DB_NAME mới vào file .env
 */
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const args = process.argv.slice(2);

// Đọc tham số dạng --key value từ dòng lệnh
function getArg(name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

const fromDb = getArg('--from');
const toDb = getArg('--to');
const envFile = path.join(__dirname, '..', getArg('--env') || '.env');
const dropTarget = args.includes('--drop');
const updateEnv = args.includes('--update-env');

if (!fromDb || !toDb) {
  console.error('Thiếu tham số. Ví dụ:');
  console.error('  node scripts/clone-database.js --from elearning_db --to huynhgia_qlhv');
  process.exit(1);
}

if (fromDb === toDb) {
  console.error('DB nguồn và DB đích phải khác nhau.');
  process.exit(1);
}

require('dotenv').config({ path: envFile });

const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT } = process.env;

async function main() {
  if (!DB_HOST || !DB_USER) {
    console.error('Thiếu DB_HOST hoặc DB_USER trong', envFile);
    process.exit(1);
  }

  const rootConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD || '',
    charset: 'utf8mb4',
    multipleStatements: true,
  });

  console.log('Kết nối MySQL:', DB_HOST);

  const [dbs] = await rootConn.query('SHOW DATABASES LIKE ?', [fromDb]);
  if (dbs.length === 0) {
    console.error(`Không tìm thấy database nguồn "${fromDb}".`);
    console.error('Chạy: mysql -u root -p -e "SHOW DATABASES;" để xem danh sách.');
    process.exit(1);
  }

  const [targetExists] = await rootConn.query('SHOW DATABASES LIKE ?', [toDb]);
  if (targetExists.length > 0) {
    if (!dropTarget) {
      console.error(`Database "${toDb}" đã tồn tại. Thêm --drop để xóa và tạo lại.`);
      process.exit(1);
    }
    console.log(`Xóa database cũ "${toDb}"...`);
    await rootConn.query(`DROP DATABASE \`${toDb}\``);
  }

  console.log(`Tạo database "${toDb}"...`);
  await rootConn.query(
    `CREATE DATABASE \`${toDb}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );

  await rootConn.query(`USE \`${fromDb}\``);
  const [tables] = await rootConn.query('SHOW TABLES');
  const tableNames = tables.map((row) => Object.values(row)[0]);

  if (tableNames.length === 0) {
    console.warn(`Database "${fromDb}" không có bảng nào. Chỉ tạo DB trống "${toDb}".`);
  } else {
    console.log(`Copy ${tableNames.length} bảng: ${fromDb} → ${toDb}`);
    // Tắt FK tạm thời để copy không bị chặn thứ tự bảng
    await rootConn.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of tableNames) {
      process.stdout.write(`  ${table}... `);
      await rootConn.query(
        `CREATE TABLE \`${toDb}\`.\`${table}\` LIKE \`${fromDb}\`.\`${table}\``
      );
      await rootConn.query(
        `INSERT INTO \`${toDb}\`.\`${table}\` SELECT * FROM \`${fromDb}\`.\`${table}\``
      );
      const [[{ cnt }]] = await rootConn.query(
        `SELECT COUNT(*) AS cnt FROM \`${toDb}\`.\`${table}\``
      );
      console.log(`${cnt} dòng`);
    }

    await rootConn.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  await rootConn.end();

  if (updateEnv) {
    let envText = fs.readFileSync(envFile, 'utf8');
    if (/^DB_NAME=.*/m.test(envText)) {
      envText = envText.replace(/^DB_NAME=.*/m, `DB_NAME=${toDb}`);
    } else {
      envText += `\nDB_NAME=${toDb}\n`;
    }
    fs.writeFileSync(envFile, envText, 'utf8');
    console.log(`Đã cập nhật DB_NAME=${toDb} trong ${envFile}`);
  } else {
    console.log('\nCập nhật backend/.env:');
    console.log(`  DB_NAME=${toDb}`);
  }

  console.log('\nHoàn tất.');
}

main().catch((err) => {
  console.error('Lỗi:', err.message);
  process.exit(1);
});
