import { copy } from 'fs-extra';
import { sync as globSync } from 'glob';
import * as path from 'path';
import * as fs from 'fs';

const sourceFolders = ['views', 'userAccess', 'resources', 'public', 'WorkflowApp'];
const destinationRoot = './dist';

const ensureDirectoryExistence = (filePath: string) => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
};

const copyNonTsFiles = async (source: string, destination: string) => {
    // Find all non-TS files in the source directory using the synchronous version of glob
    const files = globSync('**/!(*.ts)', { cwd: source, nodir: true });

    for (const file of files) {
        const srcPath = path.join(source, file);
        const destPath = path.join(destination, file);

        // Ensure destination directory exists
        ensureDirectoryExistence(destPath);

        try {
            // Copy file
            await copy(srcPath, destPath);
            // console.log(`Copied ${srcPath} to ${destPath}`);
        } catch (err) {
            console.error(`Error while copying ${srcPath} to ${destPath}:`, err);
        }
    }
};

const main = async () => {
    for (const folder of sourceFolders) {
        const sourcePath = `./${folder}`;
        const destPath = path.join(destinationRoot, folder);
        await copyNonTsFiles(sourcePath, destPath);
    }
};

main().then(() => console.log('Copying complete.')).catch(err => console.error(err));
