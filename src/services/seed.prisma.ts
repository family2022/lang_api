import prisma from './prisma';

async function main() {
  // Offices
  const subOffices = await Promise.all(
    [
      'Malkaa Nonnoo',
      'Gafarsa Guje',
      'Burayyu',
      'Sululta',
      'Mana Abbichu',
      'Laga Xafoo Laga Dadhili',
      'Kura Jida',
      'Koyyee Faccee',
      'Galaan',
      'Furii',
      'Galaan Guddaa',
      'Sabbata',
    ].map((subCity) =>
      prisma.office.create({
        data: { name: `${subCity}`, type: 'SUB_CITY' },
      })
    )
  );

  enum USER_ROLE {
    DATABASE_ADMIN = 'DATABASE_ADMIN',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN',
    HEAD = 'HEAD',
    HR = 'HR',
    FINANCE = 'FINANCE',
    RECEPTION = 'RECEPTION',
    LAND_BANK = 'LAND_BANK',
    OFFICER = 'OFFICER',
    OTHER = 'OTHER',
  }

  // Users
  const users = await Promise.all(
    [
      {
        firstName: 'Abebe',
        middleName: 'Kebede',
        lastName: 'Tadesse',
        role: 'DATABASE_ADMIN',
      },
      {
        firstName: 'Sara',
        middleName: 'Bekele',
        lastName: 'Alemu',
        role: 'HR',
      },
      {
        firstName: 'Mulu',
        middleName: 'Getahun',
        lastName: 'Desta',
        role: 'FINANCE',
      },
      {
        firstName: 'Eyasu',
        middleName: 'Abebe',
        lastName: 'Merga',
        role: 'SYSTEM_ADMIN',
      },
      {
        firstName: 'Tigist',
        middleName: 'Demeke',
        lastName: 'Mekonnen',
        role: 'OFFICER',
      },
      {
        firstName: 'Yonas',
        middleName: 'Haile',
        lastName: 'Gebremariam',
        role: 'RECEPTION',
      },
    ].map(
      (
        userData: {
          firstName: string;
          middleName: string;
          lastName: string;
          role: USER_ROLE;
        },
        index
      ) =>
        prisma.user.create({
          data: {
            ...userData,
            email: `user${index + 1}@shegercity.et`,
            phone: `0911${100000 + index}`,
            username: `user${index + 1}`,
            password:
              '$2b$10$e7.uxPuhcAVHuN2Le6v5seYJ1UW62pSFlmSFMcZxh1KQxe62MfAl6',
            status: 'ACTIVE',
            officeId: subOffices[index % subOffices.length].id,
          },
        })
    )
  );

  // LandOwners
  const landOwners = await Promise.all(
    [
      {
        firstName: 'Solomon',
        middleName: 'Biru',
        lastName: 'Tekle',
        gender: 'MALE',
      },
      {
        firstName: 'Meseret',
        middleName: 'Hailu',
        lastName: 'Ayele',
        gender: 'FEMALE',
      },
      {
        firstName: 'Tadesse',
        middleName: 'Zewdu',
        lastName: 'Gebre',
        gender: 'MALE',
      },
      {
        firstName: 'Martha',
        middleName: 'Yohannes',
        lastName: 'Degu',
        gender: 'FEMALE',
      },
      {
        firstName: 'Girma',
        middleName: 'Mengistu',
        lastName: 'Wolde',
        gender: 'MALE',
      },
      {
        firstName: 'Hanna',
        middleName: 'Fikre',
        lastName: 'Teshome',
        gender: 'FEMALE',
      },
    ].map(
      (
        ownerData: {
          firstName: string;
          middleName: string;
          lastName: string;
          gender: 'MALE' | 'FEMALE';
        },
        index
      ) =>
        prisma.landOwner.create({
          data: {
            ...ownerData,
            phone: `0922${200000 + index}`,
            email: `owner${index + 1}@shegercity.et`,
          },
        })
    )
  );
  enum LAND_TYPE {
    LEASE, // Land acquired through leasing
    PURCHASED, // Land bought by an individual or entity
    DONATED, // Land donated to an individual or organization
    INHERITED, // Land passed down through inheritance
    AGRICULTURAL, // Land used for farming or agricultural purposes
    COMMERCIAL, // Land used for business purposes
    RESIDENTIAL, // Land used for housing or residential purposesS
    INDUSTRIAL, // Land used for factories or manufacturing
    PUBLIC, // Land owned by the government or public entity
    CONSERVATION, // Land set aside for environmental protection
    NOT_ASSIGNED,
  }

  // Lands
  const lands = await Promise.all(
    [
      {
        name: 'Meskel Square Plot',
        area: 100.5,
        type: 'COMMERCIAL',
        grade: 2,
        registrationNo: 11001,
        parcelId: 'parcel-101',
        certificationNo: 'cert-101',
        wereda: '01',
        subcity: 'Bole',
        absoluteLocation: 'Bole Road, Near Airport',
        marketValue: 3000000,
      },
      {
        name: 'Addis Ababa Park',
        area: 200.0,
        type: 'PUBLIC',
        grade: 3,
        registrationNo: 11002,
        parcelId: 'parcel-102',
        certificationNo: 'cert-102',
        wereda: '02',
        subcity: 'Yeka',
        absoluteLocation: 'Yeka Hills',
        marketValue: 1000000,
      },
      {
        name: 'Commercial Hub',
        area: 50.0,
        type: 'COMMERCIAL',
        grade: 1,
        registrationNo: 11003,
        parcelId: 'parcel-103',
        certificationNo: 'cert-103',
        wereda: '03',
        subcity: 'Arada',
        absoluteLocation: 'Piassa',
        marketValue: 5000000,
      },
      {
        name: 'Industrial Zone',
        area: 300.5,
        type: 'INDUSTRIAL',
        grade: 5,
        registrationNo: 11004,
        parcelId: 'parcel-104',
        certificationNo: 'cert-104',
        wereda: '04',
        subcity: 'Addis Ketema',
        absoluteLocation: 'Kolfe',
        marketValue: 8000000,
      },
      {
        name: 'Residential Plot',
        area: 120.0,
        type: 'RESIDENTIAL',
        grade: 2,
        registrationNo: 11005,
        parcelId: 'parcel-105',
        certificationNo: 'cert-105',
        wereda: '05',
        subcity: 'Kirkos',
        absoluteLocation: 'Kirkos Church Area',
        marketValue: 2000000,
      },
      {
        name: 'Agricultural Zone',
        area: 500.0,
        type: 'AGRICULTURAL',
        grade: 1,
        registrationNo: 11006,
        parcelId: 'parcel-106',
        certificationNo: 'cert-106',
        wereda: '06',
        subcity: 'Gullele',
        absoluteLocation: 'Sululta Area',
        marketValue: 1500000,
      },
    ].map(
      (
        landData: {
          name: string;
          area: number;
          type: 'AGRICULTURAL';
          grade: number;
          registrationNo: number;
          parcelId: string;
          certificationNo: string;
          wereda: string;
          subcity: string;
          absoluteLocation: string;
          marketValue: number;
        },
        index
      ) =>
        prisma.land.create({
          data: {
            ...landData,
            landOwnerId: landOwners[index % landOwners.length].id,
            officeId: subOffices[index % subOffices.length].id,
            registeredBy: users[index % users.length].id,
          },
        })
    )
  );

  // Appointments
  await Promise.all(
    [
      {
        firstName: 'Alemayehu',
        middleName: 'Yohannes',
        lastName: 'Belay',
        phone: '0933123456',
      },
      {
        firstName: 'Tigist',
        middleName: 'Solomon',
        lastName: 'Tekle',
        phone: '0933123457',
      },
      {
        firstName: 'Dereje',
        middleName: 'Kassahun',
        lastName: 'Mengesha',
        phone: '0933123458',
      },
      {
        firstName: 'Betty',
        middleName: 'Alemu',
        lastName: 'Yosef',
        phone: '0933123459',
      },
      {
        firstName: 'Biruk',
        middleName: 'Samuel',
        lastName: 'Habte',
        phone: '0933123460',
      },
      {
        firstName: 'Lemlem',
        middleName: 'Gebru',
        lastName: 'Wolde',
        phone: '0933123461',
      },
    ].map((appointmentData, index) =>
      prisma.appointment.create({
        data: {
          ...appointmentData,
          address: 'Addis Ababa',
          reason: 'Land Registration',
          officeId: subOffices[index % subOffices.length].id,
        },
      })
    )
  );

  // Feedbacks
  await Promise.all(
    [
      {
        fullName: 'Kebede Alemu',
        phone: '0944333344',
        email: 'kebede@feedback.et',
      },
      {
        fullName: 'Mulu Solomon',
        phone: '0944333345',
        email: 'mulu@feedback.et',
      },
      {
        fullName: 'Meseret Desta',
        phone: '0944333346',
        email: 'meseret@feedback.et',
      },
      {
        fullName: 'Daniel Assefa',
        phone: '0944333347',
        email: 'daniel@feedback.et',
      },
      {
        fullName: 'Abeba Tsegaye',
        phone: '0944333348',
        email: 'abeba@feedback.et',
      },
      {
        fullName: 'Selam Kidane',
        phone: '0944333349',
        email: 'selam@feedback.et',
      },
    ].map((feedbackData, index) =>
      prisma.feedback.create({
        data: {
          ...feedbackData,
          comment: 'Very efficient service.',
          officeId: subOffices[index % subOffices.length].id,
        },
      })
    )
  );

  enum EMPLOYEE_STATUS {
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    TERMINATED,
    ON_LEAVE,
    RETIRED,
  }
  // Employees
  await Promise.all(
    [
      {
        firstName: 'Abel',
        middleName: 'Tsegaye',
        lastName: 'Gebre',
        position: 'Manager',
        email: 'abel@shegercity.et',
        phone: '0912345678',
        salary: 50000,
        status: 'ACTIVE',
        gender: 'MALE',
      },
      {
        firstName: 'Berhanu',
        middleName: 'Mehari',
        lastName: 'Abera',
        position: 'Accountant',
        email: 'berhanu@shegercity.et',
        phone: '0912345679',
        salary: 40000,
        status: 'ACTIVE',
        gender: 'FEMALE',
      },
      {
        firstName: 'Chaltu',
        middleName: 'Fikre',
        lastName: 'Demissie',
        position: 'Engineer',
        email: 'chaltu@shegercity.et',
        phone: '0912345680',
        salary: 45000,
        status: 'ACTIVE',
        gender: 'MALE',
      },
      {
        firstName: 'Dereje',
        middleName: 'Girma',
        lastName: 'Wolde',
        position: 'HR',
        email: 'dereje@shegercity.et',
        phone: '0912345681',
        salary: 42000,
        status: 'ACTIVE',
        gender: 'FEMALE',
      },
      {
        firstName: 'Elsa',
        middleName: 'Mulugeta',
        lastName: 'Worku',
        position: 'Secretary',
        email: 'elsa@shegercity.et',
        phone: '0912345682',
        salary: 38000,
        status: 'ACTIVE',
        gender: 'MALE',
      },
      {
        firstName: 'Fikadu',
        middleName: 'Asfaw',
        lastName: 'Tadesse',
        position: 'Security',
        email: 'fikadu@shegercity.et',
        phone: '0912345683',
        salary: 30000,
        status: 'ACTIVE',
        gender: 'FEMALE',
      },
    ].map(
      (
        employeeData: {
          firstName: string;
          middleName: string;
          lastName: string;
          position: string;
          email: string;
          phone: string;
          salary: number;
          status: 'ACTIVE';
          gender: 'MALE' | 'FEMALE';
        },
        index
      ) =>
        prisma.employee.create({
          data: {
            ...employeeData,
            officeId: subOffices[index % subOffices.length].id,
          },
        })
    )
  );

  // Announcements
  await Promise.all(
    [
      {
        title: 'New Year Celebration',
        description: 'Office will be closed for New Year celebrations.',
        number: 1,
        publisherId: users[0].id,
      },
      {
        title: 'Health Check',
        description: 'Health check-up scheduled for all employees.',
        number: 2,
        publisherId: users[1].id,
      },
      {
        title: 'Safety Training',
        description: 'Safety training session next week.',
        number: 3,
        publisherId: users[2].id,
      },
      {
        title: 'Quarterly Meeting',
        description: 'Quarterly meeting on business progress.',
        number: 4,
        publisherId: users[3].id,
      },
      {
        title: 'Workshop Invitation',
        description: 'All employees invited to a skill-building workshop.',
        number: 5,
        publisherId: users[4].id,
      },
      {
        title: 'Policy Update',
        description: 'Updated policies and guidelines.',
        number: 6,
        publisherId: users[5].id,
      },
    ].map((announcementData, index) =>
      prisma.announcement.create({
        data: {
          ...announcementData,
          officeId: subOffices[index % subOffices.length].id,
        },
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
