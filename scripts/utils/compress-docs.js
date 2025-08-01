import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function compressPDF(inputPath, outputPath) {
    try {
        const existingPdfBytes = fs.readFileSync(inputPath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        
        // Get all pages and optimize images
        const pages = pdfDoc.getPages();
        
        // Remove metadata to reduce size
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        
        // Aggressive compression settings
        const pdfBytes = await pdfDoc.save({
            useObjectStreams: true,  // Enable object streams for better compression
            addDefaultPage: false,
            objectsPerTick: 1000,    // Process more objects per tick
            updateFieldAppearances: false, // Skip field appearance updates
        });

        fs.writeFileSync(outputPath, pdfBytes);

        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

        return {
            originalSize,
            compressedSize,
            compressionRatio
        };
    } catch (error) {
        console.error(`❌ Error compressing ${path.basename(inputPath)}:`, error.message);
        return null;
    }
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

        console.log(`📁 Found ${folders.length} folders to process:`);
        folders.forEach(folder => console.log(`  - ${folder}`));

        for (const folder of folders) {
            const folderPath = path.join(uncompressedDocsPath, folder);
            await processFolder(folderPath);
        }

        console.log('\n🎉 PDF compression completed!');
        console.log(`📂 Compressed files saved to: ${compressedDocsPath}`);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

main();