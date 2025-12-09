import type { Express } from "express";
import { createServer, type Server } from "http";
import { modelSubmissionSchema, type ModelSubmissionWithImage } from "@shared/schema";
import { jsPDF } from "jspdf";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/submit", async (req, res) => {
    try {
      const body = req.body as ModelSubmissionWithImage;
      
      // Validate the submission data
      const validationResult = modelSubmissionSchema.safeParse(body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: validationResult.error.flatten() 
        });
      }

      const data = validationResult.data;
      const { imageBase64, imageName } = body;

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPos = 20;
      const lineHeight = 7;
      const sectionGap = 10;

      // Title
      doc.setFontSize(20);
      doc.setTextColor(192, 192, 192);
      doc.text("Model Submission Form", pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Add image if provided
      if (imageBase64) {
        try {
          const imgData = imageBase64.split(",")[1] || imageBase64;
          const imgFormat = imageBase64.includes("image/png") ? "PNG" : "JPEG";
          doc.addImage(imageBase64, imgFormat, pageWidth / 2 - 25, yPos, 50, 50);
          yPos += 60;
        } catch (imgError) {
          console.log("Could not add image to PDF:", imgError);
        }
      }

      // Personal Information Section
      doc.setFontSize(14);
      doc.setTextColor(192, 192, 192);
      doc.text("Personal Information", 20, yPos);
      yPos += lineHeight + 2;
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Full Name: ${data.fullName}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Email: ${data.email}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Phone: ${data.phone}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Address: ${data.address}`, 20, yPos);
      yPos += sectionGap;

      // Body Measurements Section
      doc.setFontSize(14);
      doc.setTextColor(192, 192, 192);
      doc.text("Body Measurements (cm)", 20, yPos);
      yPos += lineHeight + 2;
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      const measurements = [
        `Height: ${data.height} cm`,
        `Chest/Bust: ${data.chest} cm`,
        `Waist: ${data.waist} cm`,
        `Hips: ${data.hips} cm`,
        `Shoulders: ${data.shoulders} cm`,
        `Inseam: ${data.inseam} cm`,
        `Sleeve Length: ${data.sleeveLength} cm`,
        `Neck: ${data.neckCircumference} cm`,
      ];
      
      // Two columns for measurements
      for (let i = 0; i < measurements.length; i += 2) {
        doc.text(measurements[i], 20, yPos);
        if (measurements[i + 1]) {
          doc.text(measurements[i + 1], 110, yPos);
        }
        yPos += lineHeight;
      }
      yPos += sectionGap - lineHeight;

      // Gender and Morphology
      doc.setFontSize(14);
      doc.setTextColor(192, 192, 192);
      doc.text("Body Profile", 20, yPos);
      yPos += lineHeight + 2;
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Gender: ${data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}`, 20, yPos);
      yPos += lineHeight;
      doc.text(`Body Morphology: ${data.morphology}`, 20, yPos);
      yPos += sectionGap;

      // Clothing Sizes Section
      doc.setFontSize(14);
      doc.setTextColor(192, 192, 192);
      doc.text("Clothing Sizes", 20, yPos);
      yPos += lineHeight + 2;
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      
      // Header row
      doc.text("Item", 20, yPos);
      doc.text("Real Size", 90, yPos);
      doc.text("Comfort Size", 140, yPos);
      yPos += lineHeight;
      
      // Draw a line
      doc.setDrawColor(64, 64, 64);
      doc.line(20, yPos - 2, 180, yPos - 2);
      
      for (const size of data.clothingSizes) {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(size.item, 20, yPos);
        doc.text(size.realSize, 90, yPos);
        doc.text(size.comfortSize, 140, yPos);
        yPos += lineHeight;
      }
      yPos += sectionGap - lineHeight;

      // Notes Section
      if (data.notes && data.notes.trim()) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(14);
        doc.setTextColor(192, 192, 192);
        doc.text("Additional Notes", 20, yPos);
        yPos += lineHeight + 2;
        
        doc.setFontSize(10);
        doc.setTextColor(128, 128, 128);
        const splitNotes = doc.splitTextToSize(data.notes, 170);
        doc.text(splitNotes, 20, yPos);
      }

      // Get PDF as base64
      const pdfBase64 = doc.output("datauristring");
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

      // Prepare WhatsApp message (include clothing sizes)
      const clothingSizesText = (data.clothingSizes && data.clothingSizes.length)
        ? data.clothingSizes.map((s) => `${s.item}: Real ${s.realSize} / Comfort ${s.comfortSize}`).join('\n')
        : 'No clothing sizes provided';

      const whatsappMessage = encodeURIComponent(
        `New Model Submission!\n\n` +
        `Name: ${data.fullName}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${data.phone}\n` +
        `Gender: ${data.gender}\n` +
        `Morphology: ${data.morphology}\n\n` +
        `Height: ${data.height}cm\n` +
        `Chest: ${data.chest}cm\n` +
        `Waist: ${data.waist}cm\n` +
        `Hips: ${data.hips}cm\n\n` +
        `Clothing Sizes:\n` +
        `${clothingSizesText}`
      );

      const whatsappLink = `https://wa.me/21652287812?text=${whatsappMessage}`;

      // Return success with PDF and WhatsApp link
      res.json({ 
        success: true, 
        message: "Form submitted successfully",
        pdfBase64,
        whatsappLink,
        submissionData: {
          name: data.fullName,
          email: data.email,
          gender: data.gender,
          morphology: data.morphology
        }
      });

    } catch (error) {
      console.error("Submission error:", error);
      res.status(500).json({ 
        error: "Failed to process submission",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
