import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uncompressedDocsPath = path.join(__dirname, '../../uncompressed-docs');
const compressedDocsPath = path.join(__dirname, '../../compressed-docs');

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function checkGhostscriptInstalled() {
    try {
        await execAsync('gs --version');
        return true;
    } catch (error) {
        return false;
    }
}

async function compressPDFWithGhostscript(inputPath, outputPath) {
    try {
        const gsCommand = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -dDetectDuplicateImages=true -dCompressFonts=true -r150 -sOutputFile="${outputPath}" "${inputPath}"`;
        
        await execAsync(gsCommand);
        return true;
    } catch (error) {
        console.error(`Ghostscript compression failed: ${error.message}`);
        return false;
    }
}

async function compressPDFWithPdfLib(inputPath, outputPath) {
    try {
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Remove metadata to reduce size
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        pdfDoc.setCreationDate(undefined);
        pdfDoc.setModificationDate(undefined);
        
        // Aggressive compression settings
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 1000,
            updateFieldAppearances: false,
        });

        fs.writeFileSync(outputPath, pdfBytes);
        return true;
    } catch (error) {
        console.error(`PDF-lib compression failed: ${error.message}`);
        return false;
    }
}

async function compressPDF(inputPath, outputPath) {
    const originalSize = fs.statSync(inputPath).size;
    
    // Try Ghostscript first (better compression)
    const hasGhostscript = await checkGhostscriptInstalled();
    let success = false;
    
    if (hasGhostscript) {
        console.log(`   Using Ghostscript for maximum compression...`);
        success = await compressPDFWithGhostscript(inputPath, outputPath);
    }
    
    // Fallback to pdf-lib if Ghostscript fails or isn't available
    if (!success) {
        console.log(`   Using PDF-lib for compression...`);
        success = await compressPDFWithPdfLib(inputPath, outputPath);
    }
    
    if (!success) {
        return null;
    }

    const compressedSize = fs.statSync(outputPath).size;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

    return {
        originalSize,
        compressedSize,
        compressionRatio
    };
}

async function processFolder(folderPath) {
    const files = fs.readdirSync(folderPath);
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    
    if (pdfFiles.length === 0) {
        console.log(`⚠️  No PDF files found in ${path.basename(folderPath)}`);
        return;
    }

    const outputFolderPath = path.join(compressedDocsPath, path.basename(folderPath));
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
    }

    console.log(`\n📁 Processing folder: ${path.basename(folderPath)}`);
    console.log(`🔍 Found ${pdfFiles.length} PDF files`);

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let successCount = 0;

    for (const file of pdfFiles) {
        const inputPath = path.join(folderPath, file);
        const outputPath = path.join(outputFolderPath, file);

        console.log(`\n🗜️  Compressing: ${file}`);
        
        const result = await compressPDF(inputPath, outputPath);
        
        if (result) {
            totalOriginalSize += result.originalSize;
            totalCompressedSize += result.compressedSize;
            successCount++;

            console.log(`   Original: ${formatBytes(result.originalSize)}`);
            console.log(`   Compressed: ${formatBytes(result.compressedSize)}`);
            console.log(`   Reduction: ${result.compressionRatio}%`);
        }
    }

    if (successCount > 0) {
        const overallReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);
        console.log(`\n📊 Folder Summary:`);
        console.log(`   Files processed: ${successCount}/${pdfFiles.length}`);
        console.log(`   Total original size: ${formatBytes(totalOriginalSize)}`);
        console.log(`   Total compressed size: ${formatBytes(totalCompressedSize)}`);
        console.log(`   Overall reduction: ${overallReduction}%`);
    }
}

async function main() {
    try {
        console.log('🔍 Checking compression tools...');
        const hasGhostscript = await checkGhostscriptInstalled();
        
        if (hasGhostscript) {
            console.log('✅ Ghostscript found - will use maximum compression');
        } else {
            console.log('⚠️  Ghostscript not found - install with: brew install ghostscript');
            console.log('📝 Using PDF-lib for basic compression');
        }

        if (!fs.existsSync(compressedDocsPath)) {
            fs.mkdirSync(compressedDocsPath, { recursive: true });
        }

        const folders = fs.readdirSync(uncompressedDocsPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

        if (folders.length === 0) {
            console.log('❌ No folders found in uncompressed-docs directory');
            return;
        }

        console.log(`\n📁 Found ${folders.length} folders to process:`);
        folders.forEach(folder => console.log(`  - ${folder}`));

        for (const folder of folders) {
            const folderPath = path.join(uncompressedDocsPath, folder);
            await processFolder(folderPath);
        }

        console.log('\n🎉 PDF compression completed!');
        console.log(`📂 Compressed files saved to: ${compressedDocsPath}`);
        
        if (!hasGhostscript) {
            console.log('\n💡 For better compression, install Ghostscript:');
            console.log('   brew install ghostscript');
        }
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();