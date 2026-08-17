import nodemailer from "nodemailer";

export const sendMaterialEmail = async (students, material, teacherName) => {

const transporter = nodemailer.createTransport({
host: "smtp.gmail.com",
port: 465,
secure: true,   
auth: {
user: process.env.EMAIL_USER,
pass: process.env.EMAIL_PASS
},
});


{/* <ul>
<li><b>Title:</b> ${material.title}</li>
<li><b>Subject:</b> ${material.subject}</li>
<li><b>Semester:</b> ${material.semester}</li>
<li><b>Uploaded By:</b> ${teacherName}</li>
<li><b>Upload Date:</b> ${new Date(material.createdAt).toLocaleString()}</li>
<li><b>File Name:</b> ${material.fileName}</li>
<li><b>File Type:</b> ${material.fileType}</li>
<li><b>File Size:</b> ${sizeKB} KB</li>
</ul> */}

const sizeKB = (material.fileSize / 1024).toFixed(2);

const html = `
<h2>New Study Material Available</h2>

<p>Dear Students,</p>

<p>A new study material has been uploaded.</p>

<h3>Material Details</h3>

<ul>
<li><b>Title:</b> ${material.title}</li>
<li><b>Subject:</b> ${material.subject}</li>
<li><b>Uploaded By:</b> ${teacherName}</li>
<li><b>Upload Date:</b> ${new Date(material.createdAt).toLocaleString()}</li>
<li><b>File Name:</b> ${material.fileName}</li>
</ul>

<h3>Description</h3>

<p>${material.description || "No description provided"}</p>

<p>
<a href="${material.fileUrl}">
Download Material
</a>
</p>

<p>Regards<br/>Smart Campus Assistant</p>
`;

await transporter.sendMail({
from: process.env.EMAIL_USER,
to: students.join(","),
subject: `New Study Material – ${material.subject} (Semester ${material.semester})`,
html
});

};