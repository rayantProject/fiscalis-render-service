import fs from 'fs';
import path from 'path';

/**
 * Checks if the given path points to a file (based on its extension).
 * @param str - The path to check.
 * @returns true if the path has a file extension, false otherwise.
 */
export function isPathToFile(str: string): boolean {
  return path.extname(str) !== '';
}

/**
 * Ensures that a directory exists, creating it recursively if needed.
 * @param dir - The directory path to check or create.
 */
export function ensureDirectoryExists(dir: string): void {
  try {
    fs.accessSync(dir);
  } catch {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Copies a file synchronously from source to target (file or directory).
 * @param source - The source file path.
 * @param target - The target file or directory path.
 */
export function copyFileSync(source: string, target: string): void {
  if (isPathToFile(target)) {
    const targetDir = path.dirname(target);
    ensureDirectoryExists(targetDir);
    fs.copyFileSync(source, target);
  } else {
    ensureDirectoryExists(target);
    const destPath = path.join(target, path.basename(source));
    fs.copyFileSync(source, destPath);
  }
}

/**
 * Recursively copies a folder from source to target.
 * @param source - The source folder path.
 * @param target -  The target folder path.
 * @param copyWithFolder - Whether to copy the folder structure or just its contents.
 */
export function copyFolderRecursiveSync(source: string, target: string, copyWithFolder = false): void {
  if (copyWithFolder) {
    const folder = path.join(target, path.basename(source));
    ensureDirectoryExists(folder);
    return copyFolderRecursiveSync(source, folder);
  }

  ensureDirectoryExists(target);

  if (fs.lstatSync(source).isDirectory()) {
    const entries = fs.readdirSync(source);
    for (const entry of entries) {
      const srcPath = path.join(source, entry);
      if (fs.lstatSync(srcPath).isDirectory()) {
        copyFolderRecursiveSync(srcPath, path.join(target, entry));
      } else {
        copyFileSync(srcPath, target);
      }
    }
  }
}

export interface PerformCopyOptions {
  source: string | string[];
  target: string | string[];
  copyWithFolder?: boolean;
}

/**
 * Performs a synchronous copy operation based on the provided options.
 * @param options - Options for the copy operation.
 */
export function performCopy({ source, target, copyWithFolder = false }: PerformCopyOptions): void {
  if (Array.isArray(target)) {
    for (const t of target) {
      performCopy({ source, target: t, copyWithFolder });
    }
  } else if (Array.isArray(source)) {
    for (const s of source) {
      performCopy({ source: s, target, copyWithFolder });
    }
  } else if (fs.existsSync(source)) {
    const stats = fs.lstatSync(source);
    if (stats.isFile()) {
      copyFileSync(source, target);
    } else if (stats.isDirectory()) {
      copyFolderRecursiveSync(source, target, copyWithFolder);
    }
  }
}

/**
 * Cleans the target directory by removing it recursively.
 * @param target - The target directory path to clean.
 */
export function cleanTarget(target: string): void {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

/**
 * Options for the copy operation with overwrite capability.
 */
export interface CopyOptions extends PerformCopyOptions {
  overwrite?: boolean;
}

/**
 * Copies files or directories based on the provided options.
 * @param options - Options for the copy operation, including source, target, and whether to overwrite existing files.
 */
export function copy({ source, target, copyWithFolder = false, overwrite = false }: CopyOptions): void {
  console.log('Copying files...');

  if (overwrite) {
    console.log('Overwriting target folder...');
    if (Array.isArray(target)) {
      target.forEach(cleanTarget);
    } else {
      cleanTarget(target);
    }
  }

  performCopy({ source, target, copyWithFolder });

  console.log('Files copied.');
}

export default copy;
