const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Form başvurusu yap
const submitForm = async (req, res) => {
  const { type, name, email, phone, department, message } = req.body;
  try {
    const submission = await prisma.formSubmission.create({
      data: {
        type,
        name,
        email,
        phone,
        department,
        message,
      },
    });
    res.status(201).json(submission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Başvuru gönderilemedi.' });
  }
};

// Başvuruları listele (Admin)
const getSubmissions = async (req, res) => {
  try {
    const submissions = await prisma.formSubmission.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Başvurular getirilemedi.' });
  }
};

// Başvuru durumunu güncelle
const updateSubmissionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updatedSubmission = await prisma.formSubmission.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(updatedSubmission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Durum güncellenemedi.' });
  }
};

// Başvuru sil
const deleteSubmission = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.formSubmission.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Başvuru silindi.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Başvuru silinemedi.' });
  }
};

module.exports = {
  submitForm,
  getSubmissions,
  updateSubmissionStatus,
  deleteSubmission,
};
