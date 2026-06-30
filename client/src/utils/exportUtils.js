import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import pptxgen from 'pptxgenjs';
import { saveAs } from 'file-saver';

// Helper to convert image URL to base64
const imageToBase64 = async (url) => {
  if (!url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        // Basic validation for base64
        if (typeof result === 'string' && result.startsWith('data:image')) {
          resolve(result);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(`Base64 Skip: ${url}`, error.message);
    return null;
  }
};

export const exportToPDF = async (itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages) => {
  const doc = new jsPDF();
  const citiesStr = selectedCities.map(c => c.name).join(', ');

  // Premium Title Page
  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 297, 'F');
  doc.setTextColor(59, 130, 246);
  doc.setFontSize(44);
  doc.text("TRAVELOOP", 105, 100, { align: 'center' });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("Luxury Travel Portfolio", 105, 115, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(148, 163, 184);
  doc.text(`EXCLUSIVE ITINERARY FOR ${citiesStr.toUpperCase()}`, 105, 140, { align: 'center' });

  for (const act of itinerary.sort((a,b) => a.day - b.day)) {
    doc.addPage();
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(10);
    doc.text(`PHASE: ${act.slot} | DAY ${act.day}`, 14, 15);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.text(act.name.toUpperCase(), 14, 25);

    const images = activityImages[act.id] || [];
    const resImages = activityImages[act.id + "-res"] || [];

    // Main Hero Image
    if (images[0]) {
        const imgData = await imageToBase64(images[0]);
        if (imgData) doc.addImage(imgData, 'JPEG', 14, 35, 180, 90);
    }

    // Grid of Details
    let currentX = 14;
    for (let i = 1; i < Math.min(images.length, 4); i++) {
        const imgData = await imageToBase64(images[i]);
        if (imgData) {
            doc.addImage(imgData, 'JPEG', currentX, 130, 58, 40);
            currentX += 61;
        }
    }

    // Dining Sidebar
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 180, 180, 60, 'F');
    if (resImages[0]) {
        const resImg = await imageToBase64(resImages[0]);
        if (resImg) doc.addImage(resImg, 'JPEG', 19, 185, 70, 50);
    }
    doc.setTextColor(37, 99, 235);
    doc.setFontSize(14);
    doc.text(act.mealType || "Exclusive Dining", 95, 195);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(12);
    doc.text(act.restaurant || "Curated Local Spot", 95, 205);
  }

  doc.save(`Traveloop_Luxury_Portfolio.pdf`);
};

export const exportToPPT = async (itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages) => {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_WIDE';

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "0F172A" };
  
  // Decorative Shape
  titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '20%', h: '100%', fill: { color: "3b82f6" } });
  
  titleSlide.addText("TRAVELOOP", { 
    x: 2, y: 2.5, w: 8, h: 1, 
    fontSize: 72, color: "FFFFFF", bold: true, 
    fontFace: "Arial Black", align: "left" 
  });
  
  titleSlide.addText("Curated Luxury Itinerary Portfolio", { 
    x: 2, y: 3.5, w: 8, h: 0.5, 
    fontSize: 24, color: "3b82f6", 
    fontFace: "Arial", align: "left" 
  });
  
  titleSlide.addText(`${selectedCities.map(c => c.name).join(' • ')}`, { 
    x: 2, y: 4.5, w: 9, h: 0.5, 
    fontSize: 18, color: "94a3b8", italic: true 
  });

  // Destinations Overview Slide
  const overviewSlide = pptx.addSlide();
  overviewSlide.addText("YOUR DESTINATIONS", { x: 0.5, y: 0.5, w: 5, h: 0.5, fontSize: 36, bold: true, color: "0F172A" });
  
  let cityX = 0.5;
  for (const city of selectedCities.slice(0, 4)) {
    const imgUrl = (cityImages[city.name] && cityImages[city.name][0]) || null;
    if (imgUrl) {
      const b64 = await imageToBase64(imgUrl);
      if (b64) overviewSlide.addImage({ data: b64, x: cityX, y: 1.5, w: 2.8, h: 4, rounding: true });
    }
    overviewSlide.addText(city.name.toUpperCase(), { x: cityX, y: 5.6, w: 2.8, h: 0.4, fontSize: 18, bold: true, align: 'center', color: '3b82f6' });
    cityX += 3.1;
  }

  for (let i = 0; i < itinerary.length; i++) {
    const act = itinerary[i];
    const slide = pptx.addSlide();
    const images = activityImages[act.id] || [];
    const resImages = activityImages[act.id + "-res"] || [];
    
    // Premium Design 2024 Layout
    slide.background = { color: "F8FAFC" };
    
    // Left Content Bar
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 4.5, h: 7.5, fill: { color: "0F172A" } });
    
    // Day Indicator
    slide.addText(`DAY ${act.day}`, { 
      x: 0.5, y: 0.5, w: 3, h: 0.4, 
      fontSize: 20, color: "3b82f6", bold: true, 
      fontFace: "Helvetica" 
    });
    
    // Activity Name
    slide.addText(act.name.toUpperCase(), { 
      x: 0.5, y: 1.2, w: 3.5, h: 1.8, 
      fontSize: 32, color: "FFFFFF", bold: true, 
      valign: "top", fontFace: "Arial Black"
    });
    
    // City & Slot
    slide.addText(`${act.city} | ${act.slot || 'SIGHTSEEING'}`, { 
      x: 0.5, y: 3.2, w: 3.5, h: 0.3, 
      fontSize: 14, color: "94a3b8", bold: true 
    });

    // Decorative Line
    slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 3.7, w: 1.5, h: 0, line: { color: "3b82f6", width: 2 } });

    // Dining Section (if exists)
    if (act.restaurant) {
      slide.addText("DINING EXPERIENCE", { x: 0.5, y: 4.5, w: 3.5, h: 0.3, fontSize: 12, color: "3b82f6", bold: true });
      slide.addText(act.restaurant, { x: 0.5, y: 4.9, w: 3.5, h: 0.4, fontSize: 16, color: "FFFFFF", bold: true });
      
      if (resImages[0]) {
        const resB64 = await imageToBase64(resImages[0]);
        if (resB64) slide.addImage({ data: resB64, x: 0.5, y: 5.5, w: 3.5, h: 1.5, rounding: true });
      }
    }

    // Right Side Imagery
    if (images.length >= 1) {
      const img1 = await imageToBase64(images[0]);
      if (img1) slide.addImage({ data: img1, x: 4.8, y: 0.5, w: 8, h: 4, rounding: true });
    }
    
    if (images.length >= 2) {
      const img2 = await imageToBase64(images[1]);
      if (img2) slide.addImage({ data: img2, x: 4.8, y: 4.8, w: 3.8, h: 2.2, rounding: true });
    }
    
    if (images.length >= 3) {
      const img3 = await imageToBase64(images[2]);
      if (img3) slide.addImage({ data: img3, x: 9, y: 4.8, w: 3.8, h: 2.2, rounding: true });
    }

    // Global Agency Branding
    slide.addText("TRAVELOOP LUXURY PORTFOLIO", { x: 10, y: 0.2, w: 3, h: 0.3, fontSize: 10, color: "94a3b8", align: "right" });
  }

  pptx.writeFile({ fileName: `Traveloop_Luxury_Portfolio.pptx` });
};

export const exportToWord = async (itinerary, tripDays, selectedCities, totalSpent, cityImages, activityImages) => {
    // Word is already stable, but we can add more images per section
    const sections = [];
    sections.push({ children: [new Paragraph({ text: "TRAVELOOP LUXURY PORTFOLIO", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER })] });

    for (const act of itinerary) {
        const images = activityImages[act.id] || [];
        const resImages = activityImages[act.id + "-res"] || [];
        
        const children = [new Paragraph({ text: act.name, heading: HeadingLevel.HEADING_1 })];
        
        for (const img of images.slice(0, 2)) {
            const data = await imageToBase64(img);
            if (data) {
                const bytes = new Uint8Array(atob(data.split(',')[1]).split('').map(c => c.charCodeAt(0)));
                children.push(new Paragraph({ children: [new ImageRun({ data: bytes, transformation: { width: 500, height: 250 } })] }));
            }
        }
        
        if (act.restaurant) {
            children.push(new Paragraph({ text: `Dining Experience: ${act.restaurant}`, bold: true }));
            if (resImages[0]) {
                const data = await imageToBase64(resImages[0]);
                if (data) {
                    const bytes = new Uint8Array(atob(data.split(',')[1]).split('').map(c => c.charCodeAt(0)));
                    children.push(new Paragraph({ children: [new ImageRun({ data: bytes, transformation: { width: 250, height: 150 } })] }));
                }
            }
        }
        sections.push({ children });
    }

    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Traveloop_Luxury_Report.docx`);
};
