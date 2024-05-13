import { BaseController } from '.';
import { Request, Response } from 'express';
import puppeteer from 'puppeteer';

class GenerateReportController extends BaseController {
  static async generate(req: Request, res: Response) {
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

    // Set the HTML content
    const htmlContent = '<h1>Hello, Puppeteer!</h1>';
    await page.setContent(htmlContent);

    // Generate PDF
    const pdfBuffer = await page.pdf();

    // Close the browser
    await browser.close();

    // Save the PDF to a file
    // fs.writeFileSync(path.join(__dirname, 'output.pdf'), pdfBuffer);
    res.setHeader('Content-Disposition', 'filename="report11111.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBuffer);

    console.log('PDF generated successfully');
  }
}

// // global.window = {document: {createElementNS: () => {return {}} }};
// // global.navigator = {};
// // global.html2pdf = {};
// // global.btoa = () => {};

// // var fs = require('fs');
// // var jsPDF = require('jspdf');

// // var doc = new jsPDF();
// // doc.text("Hello", 10, 10);
// // var data = doc.output();

// // fs.writeFileSync('./document.pdf', data, 'binary');

// // delete global.window;
// // delete global.html2pdf;
// // delete global.navigator;
// // delete global.btoa;

export default GenerateReportController;

// Create a new PDF document
