const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PulseGoals database...\n');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.cycleConfig.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Users ─────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const managerPassword = await bcrypt.hash('Manager@123', 10);
  const employeePassword = await bcrypt.hash('Employee@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'admin@atomquest.com',
      password: adminPassword,
      role: 'ADMIN',
      department: 'Human Resources',
      designation: 'HR Director',
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'manager@atomquest.com',
      password: managerPassword,
      role: 'MANAGER',
      department: 'Engineering',
      designation: 'Engineering Manager',
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'employee@atomquest.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Software Engineer',
      managerId: manager.id,
    },
  });

  // Additional employees for realistic demo
  const employee2 = await prisma.user.create({
    data: {
      name: 'Sneha Patel',
      email: 'sneha@atomquest.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'Engineering',
      designation: 'Senior Developer',
      managerId: manager.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'amit@atomquest.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'Marketing',
      designation: 'Marketing Analyst',
      managerId: manager.id,
    },
  });

  const employee4 = await prisma.user.create({
    data: {
      name: 'Kavita Singh',
      email: 'kavita@atomquest.com',
      password: employeePassword,
      role: 'EMPLOYEE',
      department: 'Sales',
      designation: 'Sales Executive',
      managerId: manager.id,
    },
  });

  console.log('✅ Users created');

  // ─── Cycle Configs ────────────────────────────────────
  const cycles = [
    { phase: 'GOAL_SETTING', label: 'Goal Setting Phase', isOpen: true },
    { phase: 'Q1', label: 'Q1 Check-in (Jul–Sep)', isOpen: true },
    { phase: 'Q2', label: 'Q2 Check-in (Oct–Dec)', isOpen: false },
    { phase: 'Q3', label: 'Q3 Check-in (Jan–Mar)', isOpen: false },
    { phase: 'Q4', label: 'Q4 / Annual Review', isOpen: false },
  ];

  for (const cycle of cycles) {
    await prisma.cycleConfig.create({ data: cycle });
  }
  console.log('✅ Cycle configs created');

  // ─── Sample Goal Sheet for Employee 2 (Sneha - already submitted) ───
  const snehaSheet = await prisma.goalSheet.create({
    data: {
      userId: employee2.id,
      cycleYear: 2025,
      status: 'SUBMITTED',
      submittedAt: new Date('2025-05-15'),
      goals: {
        create: [
          {
            title: 'Deliver Microservices Migration',
            description: 'Complete migration of monolith to microservices architecture for payment module',
            thrustArea: 'Technical Excellence',
            uomType: 'TIMELINE',
            target: '2025-09-30',
            weightage: 35,
          },
          {
            title: 'Reduce API Response Time',
            description: 'Optimize critical API endpoints to achieve sub-200ms response time across all services',
            thrustArea: 'Performance Optimization',
            uomType: 'MAX',
            target: '200',
            weightage: 25,
          },
          {
            title: 'Achieve 95% Unit Test Coverage',
            description: 'Increase test coverage across all new microservices to ensure code quality and reliability',
            thrustArea: 'Quality Assurance',
            uomType: 'MIN',
            target: '95',
            weightage: 25,
          },
          {
            title: 'Zero Critical Production Incidents',
            description: 'Maintain zero P0/P1 incidents in production for services owned by the team',
            thrustArea: 'Operational Excellence',
            uomType: 'ZERO',
            target: '0',
            weightage: 15,
          },
        ],
      },
    },
    include: { goals: true },
  });

  // Add Q1 achievements for Sneha
  for (const goal of snehaSheet.goals) {
    let actualValue, status;
    switch (goal.uomType) {
      case 'TIMELINE':
        actualValue = '2025-08-15';
        status = 'ON_TRACK';
        break;
      case 'MAX':
        actualValue = '180';
        status = 'COMPLETED';
        break;
      case 'MIN':
        actualValue = '87';
        status = 'ON_TRACK';
        break;
      case 'ZERO':
        actualValue = '0';
        status = 'COMPLETED';
        break;
    }

    await prisma.achievement.create({
      data: {
        goalId: goal.id,
        quarter: 'Q1',
        actualValue,
        status,
        progressScore: goal.uomType === 'MIN' ? 91.6 :
                       goal.uomType === 'MAX' ? 100 :
                       goal.uomType === 'TIMELINE' ? 100 : 100,
      },
    });
  }

  console.log('✅ Sample goal sheet & achievements created for Sneha');

  // ─── Sample Goal Sheet for Amit (approved) ─────────────
  const amitSheet = await prisma.goalSheet.create({
    data: {
      userId: employee3.id,
      cycleYear: 2025,
      status: 'APPROVED',
      submittedAt: new Date('2025-05-10'),
      approvedAt: new Date('2025-05-12'),
      approvedBy: manager.id,
      goals: {
        create: [
          {
            title: 'Launch Q3 Marketing Campaign',
            description: 'Design and execute multi-channel marketing campaign for product launch in Q3',
            thrustArea: 'Revenue Growth',
            uomType: 'MIN',
            target: '1000000',
            weightage: 40,
          },
          {
            title: 'Increase Social Media Engagement',
            description: 'Grow social media engagement rate by improving content strategy and posting cadence',
            thrustArea: 'Brand Building',
            uomType: 'MIN',
            target: '50000',
            weightage: 30,
          },
          {
            title: 'Reduce Customer Acquisition Cost',
            description: 'Optimize ad spend and funnel efficiency to reduce CAC below target threshold',
            thrustArea: 'Cost Optimization',
            uomType: 'MAX',
            target: '500',
            weightage: 30,
          },
        ],
      },
    },
  });

  console.log('✅ Sample goal sheet created for Amit');

  // ─── Manager's own goal sheet ──────────────────────────
  await prisma.goalSheet.create({
    data: {
      userId: manager.id,
      cycleYear: 2025,
      status: 'APPROVED',
      submittedAt: new Date('2025-05-05'),
      approvedAt: new Date('2025-05-06'),
      approvedBy: admin.id,
      goals: {
        create: [
          {
            title: 'Team Delivery Velocity',
            description: 'Increase team sprint velocity by 20% through process improvements and blockers removal',
            thrustArea: 'Team Performance',
            uomType: 'MIN',
            target: '120',
            weightage: 30,
          },
          {
            title: 'Complete All Quarterly Check-ins',
            description: 'Conduct quarterly performance check-ins with all direct reports within the review window',
            thrustArea: 'People Development',
            uomType: 'MIN',
            target: '100',
            weightage: 25,
          },
          {
            title: 'Reduce Team Attrition',
            description: 'Maintain team attrition rate below target through engagement initiatives',
            thrustArea: 'Employee Retention',
            uomType: 'MAX',
            target: '5',
            weightage: 25,
          },
          {
            title: 'Ship Platform 2.0',
            description: 'Successfully deliver Platform 2.0 release with all planned features by deadline',
            thrustArea: 'Product Delivery',
            uomType: 'TIMELINE',
            target: '2025-12-31',
            weightage: 20,
          },
        ],
      },
    },
  });

  console.log('✅ Manager goal sheet created');

  // ─── Sample Notifications ─────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: manager.id,
        message: 'Sneha Patel has submitted her goals for review',
        type: 'GOAL_SUBMITTED',
        link: '/manager/approvals',
        isRead: false,
      },
      {
        userId: employee2.id,
        message: 'Q1 check-in window is now open — log your progress',
        type: 'QUARTER_OPEN',
        link: '/employee/achievements',
        isRead: true,
      },
      {
        userId: employee3.id,
        message: 'Your goals have been approved and locked ✓',
        type: 'GOAL_APPROVED',
        link: '/employee/goals',
        isRead: false,
      },
      {
        userId: manager.id,
        message: '3 days left to complete Q1 check-in',
        type: 'DEADLINE_APPROACHING',
        link: '/manager/checkins',
        isRead: false,
      },
    ],
  });

  console.log('✅ Sample notifications created');

  // ─── Sample Check-in ──────────────────────────────────
  await prisma.checkIn.create({
    data: {
      managerId: manager.id,
      employeeId: employee2.id,
      quarter: 'Q1',
      comment: 'Sneha is making great progress on the microservices migration. API response times have improved significantly. Continue monitoring test coverage — currently at 87% which is close to target.',
    },
  });

  console.log('✅ Sample check-in created');

  // ─── Sample Audit Logs ────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        actorName: 'Arjun Mehta',
        action: 'TOGGLE_CYCLE',
        entityType: 'CycleConfig',
        entityId: 'goal_setting',
        beforeValue: { isOpen: false },
        afterValue: { isOpen: true },
      },
      {
        actorId: manager.id,
        actorName: 'Priya Sharma',
        action: 'APPROVE_GOALS',
        entityType: 'GoalSheet',
        entityId: amitSheet.id,
        beforeValue: { status: 'SUBMITTED' },
        afterValue: { status: 'APPROVED' },
      },
    ],
  });

  console.log('✅ Sample audit logs created');
  console.log('\n🎉 Seed completed successfully!\n');

  console.log('Demo Credentials:');
  console.log('──────────────────────────────────');
  console.log('Admin:    admin@atomquest.com     / Admin@123');
  console.log('Manager:  manager@atomquest.com   / Manager@123');
  console.log('Employee: employee@atomquest.com  / Employee@123');
  console.log('──────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
