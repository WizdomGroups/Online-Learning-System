import jsPDF from "jspdf";
import "jspdf-autotable";

interface CertificationData {
  transaction: {
    id: number;
    employeeId: number;
    employeeName: string;
    department: string;
    designation: string;
    status: string;
    certificationResult: string;
    startDate: string | null;
    completedDate: string | null;
  };
  certification: {
    id: number;
    title: string;
    description: string;
    status: string;
  };
  company: {
    id: number;
    name: string;
    registrationNumber: string;
    gstNumber: string;
    address: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
  };
  assessmentResult: {
    id: number;
    score: number;
    percentage: number;
    totalQuestions: number;
    attemptedQuestions: number;
    rightAnswers: number;
    status: string;
    evaluationMode: string;
    attemptNumber: number;
    answerGroupId: string;
    startTime: string;
    endTime: string;
    duration: number;
  } | null;
}

export const generateCertificatePdf = (data: CertificationData): void => {
  console.log("Starting PDF generation with data:", data);

  // Validate input data
  if (!data || !data.transaction || !data.certification || !data.company) {
    console.error("Invalid data provided to generateCertificatePdf");
    throw new Error("Invalid certification data provided");
  }

  try {
    const doc = new jsPDF("landscape", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    console.log(
      "PDF document created, assessmentResult:",
      data.assessmentResult
    );

    // Colors matching the HTML template design
    const primaryBlue: [number, number, number] = [102, 126, 234]; // #667eea
    const textColor: [number, number, number] = [45, 55, 72]; // #2d3748
    const grayColor: [number, number, number] = [102, 102, 102]; // #666
    const lightGray: [number, number, number] = [224, 226, 232]; // #e2e8f0
    const successGreen: [number, number, number] = [72, 187, 120]; // #48bb78
    const failRed: [number, number, number] = [245, 101, 101]; // #f56565

    // Clean white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    // Add decorative corner elements (matching the HTML template corners)
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    // Top-left corner decoration
    doc.triangle(10, 10, 25, 10, 10, 25, "F");
    // Top-right corner decoration
    doc.triangle(
      pageWidth - 10,
      10,
      pageWidth - 25,
      10,
      pageWidth - 10,
      25,
      "F"
    );
    // Bottom-left corner decoration
    doc.triangle(
      10,
      pageHeight - 10,
      25,
      pageHeight - 10,
      10,
      pageHeight - 25,
      "F"
    );
    // Bottom-right corner decoration
    doc.triangle(
      pageWidth - 10,
      pageHeight - 10,
      pageWidth - 25,
      pageHeight - 10,
      pageWidth - 10,
      pageHeight - 25,
      "F"
    );

    // Outer border with gradient effect simulation
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(3);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Inner border
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(1);
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50);

    // Watermark "CERTIFIED" in background
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");

    // Save current state
    doc.saveGraphicsState();

    // Set transparency and rotation for watermark
    doc.setGState(doc.GState({ opacity: 0.03 }));

    // Calculate center position for rotated text
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // Add rotated watermark text
    doc.text("CERTIFIED", centerX, centerY, {
      align: "center",
      angle: -45,
    });

    // Restore state
    doc.restoreGraphicsState();

    // === HEADER SECTION ===

    // Company logo circle with gradient effect
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.circle(pageWidth / 2, 55, 15, "F");

    // Company initials in logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    const companyInitials = data.company.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2);
    doc.text(companyInitials, pageWidth / 2, 59, { align: "center" });

    // Company name - elegant serif font
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(20);
    doc.setFont("times", "bold");
    doc.text(data.company.name, pageWidth / 2, 80, { align: "center" });

    // Company details - smaller, organized
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);

    doc.text(data.company.address, pageWidth / 2, 90, { align: "center" });
    doc.text(
      `GST: ${data.company.gstNumber} | REG: ${data.company.registrationNumber}`,
      pageWidth / 2,
      96,
      { align: "center" }
    );
    doc.text(
      `Email: ${data.company.contactEmail} | Phone: ${data.company.contactPhone}`,
      pageWidth / 2,
      102,
      { align: "center" }
    );

    // === CERTIFICATE TITLE SECTION ===

    // Main certificate title (certification name)
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(28);
    doc.setFont("times", "bold");
    doc.text(data.certification.title, pageWidth / 2, 125, { align: "center" });

    // Certificate type subtitle
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Certificate of Achievement", pageWidth / 2, 138, {
      align: "center",
    });

    // Presentation text
    doc.text("This is to certify that", pageWidth / 2, 150, {
      align: "center",
    });

    // === RECIPIENT SECTION ===

    // Employee name - prominent and elegant
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(data.transaction.employeeName, pageWidth / 2, 170, {
      align: "center",
    });

    // Blue underline for employee name
    doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setLineWidth(2);
    const nameWidth = doc.getTextWidth(data.transaction.employeeName);
    const underlineStartX = (pageWidth - nameWidth) / 2;
    doc.line(underlineStartX, 173, underlineStartX + nameWidth, 173);

    // Employee details
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(
      `Employee ID: ${data.transaction.employeeId} | ${data.transaction.department} Department | ${data.transaction.designation}`,
      pageWidth / 2,
      182,
      { align: "center" }
    );

    // === ACHIEVEMENT SECTION ===

    // Achievement box background (light gray background)
    doc.setFillColor(247, 250, 252); // #f7fafc
    doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.setLineWidth(1);
    doc.roundedRect(40, 190, pageWidth - 80, 45, 3, 3, "FD");

    // Blue left border for achievement section
    doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.rect(40, 190, 2, 45, "F");

    // Achievement text - different for assessment vs training-only
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(74, 85, 104); // #4a5568

    if (data.assessmentResult) {
      // Assessment-based certification
      doc.text(
        "has successfully completed the certification program and demonstrated",
        pageWidth / 2,
        205,
        { align: "center" }
      );
      doc.text(
        "exceptional proficiency in the above certification",
        pageWidth / 2,
        213,
        { align: "center" }
      );
    } else {
      // Training-only certification
      doc.text(
        "has successfully completed all required training modules and",
        pageWidth / 2,
        205,
        { align: "center" }
      );
      doc.text(
        "demonstrated competency in the above certification",
        pageWidth / 2,
        213,
        { align: "center" }
      );
    }

    // Status badge
    const isPass =
      data.transaction.certificationResult.toLowerCase() === "pass";
    const badgeColor = isPass ? successGreen : failRed;
    doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    doc.roundedRect(pageWidth / 2 - 25, 220, 50, 10, 5, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(
      data.transaction.certificationResult.toUpperCase(),
      pageWidth / 2,
      226.5,
      {
        align: "center",
      }
    );

    // === SCORE DETAILS GRID ===

    const scoreBoxY = 245;
    const scoreBoxWidth = 50;
    const scoreBoxHeight = 25;
    const scoreBoxSpacing = 55;

    if (data.assessmentResult) {
      // Assessment-based certification - show score details
      const startX =
        (pageWidth - (4 * scoreBoxWidth + 3 * scoreBoxSpacing)) / 2;

      // Score boxes data for assessment
      const scoreData = [
        { value: `${data.assessmentResult.percentage}%`, label: "FINAL SCORE" },
        {
          value: `${data.assessmentResult.rightAnswers}/${data.assessmentResult.totalQuestions}`,
          label: "QUESTIONS CORRECT",
        },
        {
          value: `${data.assessmentResult.attemptNumber}${getOrdinalSuffix(
            data.assessmentResult.attemptNumber
          )}`,
          label: "ATTEMPT",
        },
        {
          value: data.assessmentResult.evaluationMode.toUpperCase(),
          label: "EVALUATION MODE",
        },
      ];

      scoreData.forEach((item, index) => {
        const boxX = startX + index * (scoreBoxWidth + scoreBoxSpacing);

        // Score box background
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(
          boxX,
          scoreBoxY,
          scoreBoxWidth,
          scoreBoxHeight,
          2,
          2,
          "FD"
        );

        // Score value
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text(item.value, boxX + scoreBoxWidth / 2, scoreBoxY + 12, {
          align: "center",
        });

        // Score label
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(item.label, boxX + scoreBoxWidth / 2, scoreBoxY + 20, {
          align: "center",
        });
      });
    } else {
      // Training-only certification - show completion details
      const startX =
        (pageWidth - (3 * scoreBoxWidth + 2 * scoreBoxSpacing)) / 2;

      // Completion details for training-only
      const completionData = [
        { value: "TRAINING", label: "CERTIFICATION TYPE" },
        { value: "COMPLETED", label: "STATUS" },
        {
          value: data.transaction.certificationResult.toUpperCase(),
          label: "RESULT",
        },
      ];

      completionData.forEach((item, index) => {
        const boxX = startX + index * (scoreBoxWidth + scoreBoxSpacing);

        // Score box background
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
        doc.setLineWidth(0.5);
        doc.roundedRect(
          boxX,
          scoreBoxY,
          scoreBoxWidth,
          scoreBoxHeight,
          2,
          2,
          "FD"
        );

        // Score value
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
        doc.text(item.value, boxX + scoreBoxWidth / 2, scoreBoxY + 12, {
          align: "center",
        });

        // Score label
        doc.setFontSize(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
        doc.text(item.label, boxX + scoreBoxWidth / 2, scoreBoxY + 20, {
          align: "center",
        });
      });
    }

    // === FOOTER SECTION ===

    const footerY = pageHeight - 30;

    // Date section - left side
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("DATE OF COMPLETION", 45, footerY - 8);

    const completionDate = data.transaction.completedDate
      ? new Date(data.transaction.completedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(completionDate, 45, footerY);

    // Signature section - right side
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("AUTHORIZED SIGNATURE", pageWidth - 45, footerY - 8, {
      align: "right",
    });

    // Signature line
    doc.setDrawColor(204, 204, 204);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 80, footerY - 12, pageWidth - 20, footerY - 12);

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Certification Authority", pageWidth - 45, footerY - 4, {
      align: "right",
    });

    // Generate filename
    const filename = `Certificate_${data.transaction.employeeName.replace(
      /\s+/g,
      "_"
    )}_${data.certification.title.replace(/\s+/g, "_")}.pdf`;

    console.log("About to save PDF with filename:", filename);

    // Save the PDF
    doc.save(filename);
    console.log("PDF saved successfully!");

    // Also try to open in new tab for debugging
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    console.log("PDF URL created:", pdfUrl);

    // Uncomment the line below to open PDF in new tab for debugging
    // window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

// Helper function for ordinal suffixes
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return "st";
  if (j === 2 && k !== 12) return "nd";
  if (j === 3 && k !== 13) return "rd";
  return "th";
}

export default generateCertificatePdf;
