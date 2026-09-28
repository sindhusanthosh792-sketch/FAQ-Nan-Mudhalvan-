const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const FAQ = require('./models/FAQ');

const seedData = async () => {
  await connectDB();

  console.log('Seeding database with initial Naan Mudhalvan academic dataset...');

  // Clear existing collections
  await User.deleteMany({});
  await Category.deleteMany({});
  await FAQ.deleteMany({});

  // 1. Create Default Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const studentPassword = await bcrypt.hash('Student@123', salt);

  const adminUser = await User.create({
    name: 'Academic Administrator',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin'
  });

  const studentUser = await User.create({
    name: 'Sample Student',
    email: 'student@example.com',
    password: studentPassword,
    role: 'user'
  });

  console.log(`Created default admin: admin@example.com / Admin@123`);
  console.log(`Created default user: student@example.com / Student@123`);

  // 2. Create 9 Core Categories
  const categoryDocs = [
    { name: 'General', description: 'General academic campus queries and institute information.' },
    { name: 'College', description: 'Information regarding college working hours, facilities, and campus locations.' },
    { name: 'Courses', description: 'Curriculum, course registration, electives, and credit requirements.' },
    { name: 'Exams', description: 'Examination schedules, hall tickets, revaluation, and semester results.' },
    { name: 'Fees', description: 'Tuition fees payment schedules, online payment portals, and penalty rules.' },
    { name: 'Admission', description: 'Eligibility criteria, admission procedures, documents, and cutoffs.' },
    { name: 'Placements', description: 'Placement drives, campus interview schedules, resume portal, and eligibility.' },
    { name: 'Scholarships', description: 'Government and institutional scholarship schemes, eligibility, and applications.' },
    { name: 'Technical Support', description: 'Student portal password reset, WiFi access, LMS support, and lab accounts.' }
  ];

  const createdCategories = await Category.insertMany(categoryDocs);
  const categoryMap = {};
  createdCategories.forEach(cat => {
    categoryMap[cat.name] = cat._id;
  });

  console.log(`Seeded ${createdCategories.length} Categories.`);

  // 3. Create Sample FAQs
  const sampleFaqs = [
    // General
    {
      question: 'What are the official working hours of the college administrative office?',
      answer: 'The administrative office operates Monday through Friday from 9:00 AM to 5:00 PM, and on Saturdays from 9:00 AM to 1:00 PM.',
      category: categoryMap['General'],
      keywords: ['working hours', 'office time', 'timing', 'admin office', 'contact hours']
    },
    {
      question: 'How can I contact the college helpdesk or enquiry department?',
      answer: 'You can reach the helpdesk by emailing support@college.edu.in or by calling the helpline at +91 44 2345 6789 during office hours.',
      category: categoryMap['General'],
      keywords: ['contact', 'helpdesk', 'enquiry', 'phone number', 'email']
    },

    // College
    {
      question: 'What facilities are available in the college campus library?',
      answer: 'The central library offers over 50,000 physical books, digital e-journal databases (IEEE, Springer), quiet study zones, computer terminals, and reprographic services.',
      category: categoryMap['College'],
      keywords: ['library', 'books', 'e-journals', 'reading room', 'facilities']
    },
    {
      question: 'Is hostel accommodation provided for outstation students?',
      answer: 'Yes, separate hostels for male and female students are available inside the campus with 24/7 security, high-speed WiFi, and hygienic dining halls.',
      category: categoryMap['College'],
      keywords: ['hostel', 'accommodation', 'dormitory', 'mess', 'residence']
    },

    // Courses
    {
      question: 'How many credits are required to complete the B.E. / B.Tech degree program?',
      answer: 'Students must earn a minimum of 160 credits across 8 semesters, including core subjects, professional electives, open electives, and a final year project.',
      category: categoryMap['Courses'],
      keywords: ['credits', 'btech', 'degree requirement', 'curriculum', 'electives']
    },
    {
      question: 'What is the minimum attendance percentage needed to appear for semester exams?',
      answer: 'Students must maintain a minimum of 75% attendance in each registered subject to be eligible for end-semester examinations.',
      category: categoryMap['Courses'],
      keywords: ['attendance', 'condonation', 'percentage', 'minimum attendance', 'eligibility']
    },

    // Exams
    {
      question: 'Where can I check my exam details, schedule and hall ticket?',
      answer: 'You can view your exam schedule, seating plan, and download your hall ticket by logging into the Student Portal under the Exam Cell tab.',
      category: categoryMap['Exams'],
      keywords: ['exam details', 'hall ticket', 'exam schedule', 'time table', 'results', 'seating plan']
    },
    {
      question: 'How do I apply for answer script revaluation or re-totalling?',
      answer: 'Revaluation applications open within 10 days after result announcement. Submit the revaluation request form along with the prescribed fee via the Student Portal.',
      category: categoryMap['Exams'],
      keywords: ['revaluation', 'retotalling', 'rechecking', 'answer sheet', 'results']
    },

    // Fees
    {
      question: 'What are the modes of payment for semester tuition fees?',
      answer: 'Tuition fees can be paid online via Credit/Debit card, Net Banking, or UPI through the College Online Payment Gateway on the student dashboard.',
      category: categoryMap['Fees'],
      keywords: ['fee payment', 'online fee', 'tuition fees', 'upi', 'net banking', 'receipt']
    },
    {
      question: 'What is the last date to pay the semester fee without a late fine?',
      answer: 'The last date for fee payment is typically 15 days from the commencement of the semester. A late fine of Rs. 100/day applies thereafter.',
      category: categoryMap['Fees'],
      keywords: ['due date', 'late fee', 'penalty', 'tuition deadline', 'fine']
    },

    // Admission
    {
      question: 'What documents are required during the physical admission verification?',
      answer: 'Candidates must bring original 10th & 12th marksheets, Transfer Certificate (TC), Conduct Certificate, Community Certificate, Provisional Allotment Letter, and 5 passport photos.',
      category: categoryMap['Admission'],
      keywords: ['documents required', 'admission certificates', 'tc', 'marksheets', 'verification']
    },

    // Placements
    {
      question: 'What are the eligibility criteria to register for campus placement drives?',
      answer: 'Students must have a minimum CGPA of 6.0 with no standing arrears/backlogs at the time of recruitment drives to participate in tier-1 placement companies.',
      category: categoryMap['Placements'],
      keywords: ['placement eligibility', 'cgpa requirement', 'arrears', 'campus interviews', 'jobs']
    },

    // Scholarships
    {
      question: 'How do I apply for scholarship schemes?',
      answer: 'You can apply for scholarships through the scholarship section. Please check the available scholarship requirements and application details on the Naan Mudhalvan and Government scholarship portals.',
      category: categoryMap['Scholarships'],
      keywords: ['apply for scholarship', 'scholarship section', 'financial aid', 'stipend', 'fresh scholarship']
    },

    // Technical Support
    {
      question: 'How do I reset my forgotten student portal password?',
      answer: 'Click on the "Forgot Password" link on the login page or contact the IT Helpdesk with your registered Roll Number to request a temporary password reset token.',
      category: categoryMap['Technical Support'],
      keywords: ['password reset', 'forgot password', 'lms login', 'portal access', 'technical help']
    }
  ];

  await FAQ.insertMany(sampleFaqs);
  console.log(`Seeded ${sampleFaqs.length} Sample FAQs.`);

  console.log('Seeding completed successfully!');
  process.exit(0);
};

seedData().catch(err => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
