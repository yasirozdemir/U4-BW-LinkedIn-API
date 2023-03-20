import PdfPrinter from "pdfmake";
import imageToBase64 from "image-to-base64";
import ExperienceModel from "../experiences/model.js";

export const getPDFReadableStream = async (user) => {
  console.log(user);
  const experienceArray = [];
  //   const experince = await ExperienceModel.findById(user.experiences.toString());

  console.log("new", experienceArray);
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
    Roboto: {
      normal: "Roboto",
      bold: "Roboto-Bold",
      italics: "Roboto-Oblique",
      bolditalics: "Roboto-BoldOblique",
    },
  };
  const printer = new PdfPrinter(fonts);
  const imageEncoded = await imageToBase64(user.image);

  const docDefinition = {
    content: [
      {
        text: "Curriculum Vitae",
        style: "header",
      },
      {
        columns: [
          {
            image: `data:image/jpeg;base64,${imageEncoded}`,
            width: 75,
          },
          [
            {
              text: user.title + " " + user.name + " " + user.surname,
              style: "subheader",
              margin: [10, 0, 0, 0],
            },
            { text: user.area, fontSize: 12, margin: [10, 0, 0, 0] },
            { text: user.email, fontSize: 12, margin: [10, 0, 0, 0] },
          ],
        ],
      },
      {
        text: user.bio,
        style: "quote",
        margin: [0, 20, 0, 20],
      },
      {
        text: "User Experiences",
        style: "header",
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", "*", "*", "*", "*"],
          body: user.experiences.map((experience) => {
            return [
              [
                { text: "Role", style: "tableHeader" },
                { text: "Company", style: "tableHeader" },
                { text: "Start Date", style: "table" },
                { text: "End Date", style: "table" },
                { text: "Description", style: "table", margin: [0, 0, 0, 25] },
              ],

              [
                experience.role,
                experience.company,
                experience.startDate.toDateString(),
                experience.endDate.toDateString(),
                experience.description,
              ],
            ];
          }),
        },
        layout: "noBorders",
      },
    ],

    styles: {
      header: {
        fontSize: 22,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      subheader: {
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5],
      },
      tableHeader: {
        bold: true,
        fontSize: 13,
        color: "black",
      },
      quote: {
        italics: true,
      },
    },
    defaultStyle: {
      font: "Helvetica",
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};
