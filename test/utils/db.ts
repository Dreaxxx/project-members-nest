import * as fs from 'fs';
import * as path from 'path';

export function prepareTestDb() {
    const src = path.resolve(process.cwd(), 'data/app.db');
    const tmpDir = path.resolve(process.cwd(), 'test/tmp');
    fs.mkdirSync(tmpDir, { recursive: true });

    const dst = path.join(tmpDir, `app.e2e.${Date.now()}.db`);
    fs.copyFileSync(src, dst);

    process.env.DB_PATH = dst;
    return dst;
}
