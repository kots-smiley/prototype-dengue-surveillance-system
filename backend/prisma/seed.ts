import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  ICD10_REFERENCE,
  LOINC_REFERENCE,
  SNOMED_REFERENCE,
} from '../src/configuration/constants';

const prisma = new PrismaClient();

// Health facilities across the Municipality of Lopez (cross-facility EHR).
const FACILITIES = [
  { code: 'LPZ-RHU', name: 'Lopez Rural Health Unit (Main)', type: 'RHU_MAIN' },
  { code: 'LPZ-MH', name: 'Lopez Municipal Hospital', type: 'MUNICIPAL_HOSPITAL' },
  { code: 'BHS-BYB', name: 'Bayabas Barangay Health Station', type: 'BARANGAY_HEALTH_STATION' },
  { code: 'BHS-BRG', name: 'Burgos Barangay Health Station', type: 'BARANGAY_HEALTH_STATION' },
  { code: 'BHS-SNI', name: 'San Isidro Barangay Health Station', type: 'BARANGAY_HEALTH_STATION' },
];

// --- Reference data ---------------------------------------------------------

// A representative set of barangays in the Municipality of Lopez, Quezon.
const BARANGAYS = [
  { name: 'Bayabas', code: 'LPZ-BYB' },
  { name: 'Burgos', code: 'LPZ-BRG' },
  { name: 'Cogorin Ibaba', code: 'LPZ-CGI' },
  { name: 'Danlagan', code: 'LPZ-DNL' },
  { name: 'Del Pilar (Poblacion)', code: 'LPZ-DPL' },
  { name: 'Magsaysay (Poblacion)', code: 'LPZ-MGS' },
  { name: 'Rizal (Poblacion)', code: 'LPZ-RZL' },
  { name: 'San Isidro', code: 'LPZ-SNI' },
  { name: 'Santo Niño', code: 'LPZ-STN' },
  { name: 'Villa Aurora', code: 'LPZ-VLA' },
];

// PIDSR-style notifiable diseases with configurable, per-disease thresholds.
const DISEASES = [
  {
    name: 'Dengue',
    code: 'DENG',
    category: 'VECTOR_BORNE',
    description: 'Mosquito-borne viral infection (Aedes aegypti).',
    color: '#ef4444',
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    caseThreshold: 10,
    spikePercentage: 50,
  },
  {
    name: 'Malaria',
    code: 'MAL',
    category: 'VECTOR_BORNE',
    description: 'Mosquito-borne parasitic disease (Anopheles).',
    color: '#f97316',
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    caseThreshold: 5,
    spikePercentage: 50,
  },
  {
    name: 'Typhoid Fever',
    code: 'TYPH',
    category: 'WATER_BORNE',
    description: 'Bacterial infection from contaminated food/water (Salmonella Typhi).',
    color: '#06b6d4',
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    caseThreshold: 8,
    spikePercentage: 50,
  },
  {
    name: 'Acute Bloody Diarrhea',
    code: 'ABD',
    category: 'WATER_BORNE',
    description: 'Diarrheal illness with visible blood, often water/food related.',
    color: '#0ea5e9',
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    caseThreshold: 10,
    spikePercentage: 50,
  },
  {
    name: 'Leptospirosis',
    code: 'LEPTO',
    category: 'WATER_BORNE',
    description: 'Bacterial infection associated with floodwater exposure.',
    color: '#3b82f6',
    seasonalMonths: [6, 7, 8, 9, 10, 11],
    caseThreshold: 5,
    spikePercentage: 50,
  },
  {
    name: 'Influenza-like Illness',
    code: 'ILI',
    category: 'AIRBORNE',
    description: 'Respiratory illness with fever and cough/sore throat.',
    color: '#8b5cf6',
    seasonalMonths: [12, 1, 2],
    caseThreshold: 15,
    spikePercentage: 50,
  },
  {
    name: 'Measles',
    code: 'MEAS',
    category: 'AIRBORNE',
    description: 'Highly contagious viral disease, vaccine-preventable.',
    color: '#ec4899',
    seasonalMonths: [],
    caseThreshold: 3,
    spikePercentage: 50,
  },
  {
    name: 'Tuberculosis',
    code: 'TB',
    category: 'AIRBORNE',
    description: 'Bacterial infection primarily affecting the lungs.',
    color: '#a855f7',
    seasonalMonths: [],
    caseThreshold: 10,
    spikePercentage: 40,
  },
  {
    name: 'COVID-19',
    code: 'COVID',
    category: 'AIRBORNE',
    description: 'Respiratory illness caused by SARS-CoV-2.',
    color: '#64748b',
    seasonalMonths: [],
    caseThreshold: 20,
    spikePercentage: 50,
  },
];

async function seedBarangays() {
  for (const b of BARANGAYS) {
    await prisma.barangay.upsert({
      where: { code: b.code },
      update: { name: b.name, municipality: 'Lopez', province: 'Quezon' },
      create: { ...b, municipality: 'Lopez', province: 'Quezon' },
    });
  }
  console.log(`Seeded ${BARANGAYS.length} barangays.`);
}

async function seedDiseases() {
  for (const d of DISEASES) {
    await prisma.disease.upsert({
      where: { code: d.code },
      update: { ...d, isNotifiable: true, isActive: true },
      create: { ...d, isNotifiable: true, isActive: true },
    });
  }
  console.log(`Seeded ${DISEASES.length} diseases.`);
}

async function seedUsers() {
  const firstBarangay = await prisma.barangay.findFirst({ orderBy: { name: 'asc' } });

  const users = [
    {
      email: 'admin@healthwatch.local',
      password: 'admin123',
      firstName: 'RHU',
      lastName: 'Administrator',
      role: 'ADMIN',
      barangayId: null as string | null,
    },
    {
      email: 'bhw@healthwatch.local',
      password: 'bhw123',
      firstName: 'Barangay',
      lastName: 'Health Worker',
      role: 'BHW',
      barangayId: firstBarangay?.id ?? null,
    },
    {
      email: 'hospital@healthwatch.local',
      password: 'hospital123',
      firstName: 'Hospital',
      lastName: 'Encoder',
      role: 'HOSPITAL_ENCODER',
      barangayId: null,
    },
    {
      email: 'physician@healthwatch.local',
      password: 'physician123',
      firstName: 'Maria',
      lastName: 'Santos, MD',
      role: 'PHYSICIAN',
      barangayId: null,
    },
    {
      email: 'nurse@healthwatch.local',
      password: 'nurse123',
      firstName: 'Jose',
      lastName: 'Reyes, RN',
      role: 'NURSE',
      barangayId: null,
    },
    {
      email: 'midwife@healthwatch.local',
      password: 'midwife123',
      firstName: 'Ana',
      lastName: 'Cruz, RM',
      role: 'MIDWIFE',
      barangayId: null,
    },
    {
      email: 'mho@healthwatch.local',
      password: 'mho123',
      firstName: 'Municipal',
      lastName: 'Health Officer',
      role: 'HEALTH_OFFICER',
      barangayId: null,
    },
  ];

  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        barangayId: u.barangayId,
        isActive: true,
      },
      create: {
        email: u.email,
        password,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        barangayId: u.barangayId,
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${users.length} users.`);
}

async function seedSampleData() {
  const existingReports = await prisma.riskReport.count();
  if (existingReports > 0) {
    console.log('Sample risk reports already present, skipping sample data generation.');
    return;
  }

  const barangays = await prisma.barangay.findMany();
  const reporter = await prisma.user.findFirst({ where: { role: 'BHW' } });
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  const reporterId = reporter?.id ?? admin?.id;
  if (!reporterId || barangays.length === 0) return;

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const now = new Date();

  // Generate environmental risk reports for the current and previous month.
  const CATEGORIES = ['VECTOR_BORNE', 'WATER_BORNE', 'AIRBORNE'];
  const factorsForCategory: Record<string, string[]> = {
    VECTOR_BORNE: ['stagnantWater', 'poorWasteDisposal', 'cloggedDrainage', 'housingCongestion'],
    WATER_BORNE: ['unsafeWaterSource', 'poorSanitation', 'openDefecation', 'foodContamination'],
    AIRBORNE: ['overcrowding', 'poorVentilation', 'activeRespiratoryCase'],
  };

  let reportCount = 0;
  for (let monthsAgo = 1; monthsAgo >= 0; monthsAgo--) {
    for (const barangay of barangays) {
      if (Math.random() > 0.6) continue;
      const category = pick(CATEGORIES);
      const flags = factorsForCategory[category].reduce(
        (acc, key) => ({ ...acc, [key]: Math.random() > 0.5 }),
        {} as Record<string, boolean>
      );
      await prisma.riskReport.create({
        data: {
          barangayId: barangay.id,
          reportedBy: reporterId,
          category,
          dateReported: new Date(now.getFullYear(), now.getMonth() - monthsAgo, randomInt(1, 27)),
          ...flags,
        },
      });
      reportCount++;
    }
  }
  console.log(`Seeded ${reportCount} sample risk reports.`);
}

function ageGroupFromAge(age: number): string {
  if (age <= 5) return '0-5';
  if (age <= 12) return '6-12';
  if (age <= 18) return '13-18';
  if (age <= 30) return '19-30';
  if (age <= 50) return '31-50';
  return '50+';
}

async function seedEmr() {
  const existingPatients = await prisma.patient.count();
  if (existingPatients > 0) {
    console.log('Patients already present, skipping EMR sample data.');
    return;
  }

  const barangays = await prisma.barangay.findMany();
  const physician = await prisma.user.findFirst({ where: { role: 'PHYSICIAN' } });
  const dengue = await prisma.disease.findUnique({ where: { code: 'DENG' } });
  const lepto = await prisma.disease.findUnique({ where: { code: 'LEPTO' } });
  const typhoid = await prisma.disease.findUnique({ where: { code: 'TYPH' } });
  if (barangays.length === 0 || !physician) return;

  const year = new Date().getFullYear();
  const now = new Date();

  const samplePatients = [
    { firstName: 'Juan', middleName: 'P.', lastName: 'Dela Cruz', sex: 'MALE', birthDate: new Date(1990, 4, 12) },
    { firstName: 'Maria', middleName: 'L.', lastName: 'Bautista', sex: 'FEMALE', birthDate: new Date(1995, 8, 3) },
    { firstName: 'Pedro', middleName: 'R.', lastName: 'Gonzales', sex: 'MALE', birthDate: new Date(2018, 1, 20) },
    { firstName: 'Rosa', middleName: 'M.', lastName: 'Villanueva', sex: 'FEMALE', birthDate: new Date(2000, 11, 9) },
  ];

  let seq = 0;
  for (const sp of samplePatients) {
    seq++;
    const barangay = barangays[seq % barangays.length];
    const patient = await prisma.patient.create({
      data: {
        patientCode: `P-${year}-${String(seq).padStart(4, '0')}`,
        firstName: sp.firstName,
        middleName: sp.middleName,
        lastName: sp.lastName,
        birthDate: sp.birthDate,
        sex: sp.sex,
        barangayId: barangay.id,
        consentGiven: true,
        consentDate: now,
        registeredById: physician.id,
        isActive: true,
      },
    });

    // Second patient: SUSPECTED case from registration with notifiable disease.
    if (seq === 2 && dengue) {
      const age = year - sp.birthDate.getFullYear();
      await prisma.case.create({
        data: {
          diseaseId: dengue.id,
          barangayId: barangay.id,
          reportedBy: physician.id,
          patientId: patient.id,
          autoGenerated: true,
          dateReported: now,
          age,
          ageGroup: ageGroupFromAge(age),
          sex: sp.sex,
          status: 'SUSPECTED',
          outcome: 'ONGOING',
          source: 'RHU',
          notes: 'Auto-generated from patient registration.',
        },
      });
    }

    // First patient gets a full encounter with a confirmed dengue diagnosis,
    // which also produces a linked, de-identified surveillance case.
    if (seq === 1 && dengue) {
      await prisma.allergy.create({
        data: { patientId: patient.id, substance: 'Penicillin', reaction: 'Rash', severity: 'MODERATE' },
      });

      await prisma.medicalHistoryEntry.createMany({
        data: [
          { patientId: patient.id, category: 'PMH', description: 'Asthma (childhood, well controlled)' },
          { patientId: patient.id, category: 'SOCIAL', description: 'Non-smoker; works as tricycle driver' },
        ],
      });

      const encounter = await prisma.encounter.create({
        data: {
          patientId: patient.id,
          barangayId: barangay.id,
          clinicianId: physician.id,
          type: 'CONSULT',
          encounterDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5),
          chiefComplaint: 'Fever and body aches for 3 days',
          subjective: 'High-grade fever, retro-orbital pain, myalgia.',
          objective: 'Febrile, (+) tourniquet test, no bleeding.',
          assessment: 'Dengue fever, probable.',
          plan: 'Hydration, paracetamol, CBC monitoring, advise warning signs.',
          vitalSign: {
            create: { systolic: 110, diastolic: 70, temperature: 38.9, heartRate: 96, respiratoryRate: 20, oxygenSat: 98, weight: 68, height: 170, bmi: 23.5 },
          },
          diagnoses: {
            create: [
              { diseaseId: dengue.id, icd10Code: 'A90', description: 'Dengue fever', certainty: 'CONFIRMED', isPrimary: true },
            ],
          },
          prescriptions: {
            create: [{ items: [{ drug: 'Paracetamol', dose: '500mg', frequency: 'every 6 hours', duration: '5 days' }] }],
          },
        },
      });

      await prisma.medication.create({
        data: {
          patientId: patient.id,
          encounterId: encounter.id,
          drug: 'Paracetamol',
          dose: '500mg',
          frequency: 'every 6 hours',
          status: 'ACTIVE',
        },
      });

      await prisma.encounter.create({
        data: {
          patientId: patient.id,
          barangayId: barangay.id,
          clinicianId: physician.id,
          type: 'FOLLOWUP',
          encounterDate: now,
          chiefComplaint: 'Follow-up dengue monitoring',
          assessment: 'Improving; afebrile today.',
          vitalSign: {
            create: { systolic: 118, diastolic: 76, temperature: 37.2, heartRate: 82, respiratoryRate: 18, oxygenSat: 99, weight: 67.5, height: 170, bmi: 23.4 },
          },
        },
      });

      await prisma.labResult.create({
        data: {
          patientId: patient.id,
          testName: 'Dengue NS1 antigen',
          loincCode: '5404-9',
          status: 'ORDERED',
          orderedById: physician.id,
        },
      });

      await prisma.labResult.create({
        data: {
          patientId: patient.id,
          testName: 'Platelet count',
          loincCode: '777-3',
          status: 'RESULTED',
          value: '145',
          unit: '10*3/uL',
          referenceRange: '150-400',
          orderedById: physician.id,
        },
      });

      const age = year - sp.birthDate.getFullYear();
      await prisma.case.create({
        data: {
          diseaseId: dengue.id,
          barangayId: barangay.id,
          reportedBy: physician.id,
          patientId: patient.id,
          sourceEncounterId: encounter.id,
          autoGenerated: true,
          dateReported: now,
          age,
          ageGroup: ageGroupFromAge(age),
          sex: sp.sex,
          status: 'CONFIRMED',
          outcome: 'ONGOING',
          source: 'RHU',
          notes: `Auto-generated from EMR encounter ${encounter.id}.`,
        },
      });

      await prisma.immunization.create({
        data: { patientId: patient.id, vaccine: 'Tetanus Toxoid', doseNumber: 1, dateGiven: now },
      });
    }

    // Child patient gets an immunization record (EPI).
    if (seq === 3) {
      await prisma.immunization.create({
        data: { patientId: patient.id, vaccine: 'Measles, Mumps, Rubella (MMR)', doseNumber: 1, dateGiven: now },
      });
    }

    // Adult female gets a prenatal record.
    if (seq === 4) {
      await prisma.maternalRecord.create({
        data: { patientId: patient.id, prenatalVisit: 1, lmp: new Date(now.getFullYear(), now.getMonth() - 2, 1), visitDate: now },
      });
    }
  }

  // Additional patient-linked cases spread over prior months for forecast aggregates.
  const extraDiseases = [dengue, lepto, typhoid].filter(Boolean) as Array<{ id: string; code: string }>;
  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  let extraCaseCount = 0;
  for (let monthsAgo = 9; monthsAgo >= 0; monthsAgo--) {
    for (const disease of extraDiseases) {
      const baseCount = randomInt(0, 2) + (monthsAgo <= 2 ? randomInt(0, 2) : 0);
      for (let i = 0; i < baseCount; i++) {
        const barangay = pick(barangays);
        const birthYear = year - randomInt(5, 65);
        const birthDate = new Date(birthYear, randomInt(0, 11), randomInt(1, 28));
        const sex = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
        const seqNum = samplePatients.length + extraCaseCount + 1;
        const patient = await prisma.patient.create({
          data: {
            patientCode: `P-${year}-${String(seqNum).padStart(4, '0')}`,
            firstName: 'Demo',
            lastName: `Patient ${seqNum}`,
            birthDate,
            sex,
            barangayId: barangay.id,
            consentGiven: true,
            consentDate: now,
            registeredById: physician.id,
            isActive: true,
          },
        });

        const encounterDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, randomInt(1, 27));
        const encounter = await prisma.encounter.create({
          data: {
            patientId: patient.id,
            barangayId: barangay.id,
            clinicianId: physician.id,
            type: 'CONSULT',
            encounterDate,
            assessment: `Confirmed ${disease.code} case (seed).`,
            diagnoses: {
              create: [
                {
                  diseaseId: disease.id,
                  description: disease.code,
                  certainty: 'CONFIRMED',
                  isPrimary: true,
                },
              ],
            },
          },
        });

        const age = year - birthYear;
        await prisma.case.create({
          data: {
            diseaseId: disease.id,
            barangayId: barangay.id,
            reportedBy: physician.id,
            patientId: patient.id,
            sourceEncounterId: encounter.id,
            autoGenerated: true,
            dateReported: encounterDate,
            age,
            ageGroup: ageGroupFromAge(age),
            sex,
            status: 'CONFIRMED',
            outcome: Math.random() > 0.85 ? 'RECOVERED' : 'ONGOING',
            source: 'RHU',
            notes: `Auto-generated from EMR encounter ${encounter.id}.`,
          },
        });
        extraCaseCount++;
      }
    }
  }

  console.log(`Seeded ${samplePatients.length} EMR patients with encounters and program records.`);
  if (extraCaseCount > 0) {
    console.log(`Seeded ${extraCaseCount} additional patient-linked surveillance cases.`);
  }
}

async function seedFacilities() {
  const barangayByCode = new Map(
    (await prisma.barangay.findMany()).map((b) => [b.code, b.id])
  );
  const facilityBarangay: Record<string, string | undefined> = {
    'BHS-BYB': 'LPZ-BYB',
    'BHS-BRG': 'LPZ-BRG',
    'BHS-SNI': 'LPZ-SNI',
  };

  for (const f of FACILITIES) {
    const barangayId = facilityBarangay[f.code]
      ? barangayByCode.get(facilityBarangay[f.code] as string)
      : undefined;
    await prisma.facility.upsert({
      where: { code: f.code },
      update: { name: f.name, type: f.type, barangayId: barangayId ?? null, isActive: true },
      create: { code: f.code, name: f.name, type: f.type, barangayId: barangayId ?? null, isActive: true },
    });
  }
  console.log(`Seeded ${FACILITIES.length} facilities.`);
}

async function seedTerminology() {
  const concepts = [
    ...ICD10_REFERENCE.map((c) => ({ system: 'ICD10', code: c.code, display: c.description, diseaseCode: c.diseaseCode })),
    ...LOINC_REFERENCE.map((c) => ({ system: 'LOINC', code: c.code, display: c.display })),
    ...SNOMED_REFERENCE.map((c) => ({ system: 'SNOMED', code: c.code, display: c.display })),
  ];
  for (const c of concepts) {
    await prisma.terminologyConcept.upsert({
      where: { system_code: { system: c.system, code: c.code } },
      update: { display: c.display, diseaseCode: c.diseaseCode ?? null },
      create: { system: c.system, code: c.code, display: c.display, diseaseCode: c.diseaseCode ?? null },
    });
  }
  console.log(`Seeded ${concepts.length} terminology concepts.`);
}

/**
 * Wire the EHR layer together: assign providers/patients/encounters to the RHU
 * main facility and create a sample cross-facility referral and sharing consent.
 */
async function seedEhrLinks() {
  const rhu = await prisma.facility.findUnique({ where: { code: 'LPZ-RHU' } });
  const hospital = await prisma.facility.findUnique({ where: { code: 'LPZ-MH' } });
  if (!rhu || !hospital) return;

  // Assign clinical staff without a facility to the RHU main.
  await prisma.user.updateMany({
    where: { role: { in: ['PHYSICIAN', 'NURSE', 'MIDWIFE', 'FACILITY_ADMIN'] }, facilityId: null },
    data: { facilityId: rhu.id },
  });

  // Backfill home facility on patients and facility on encounters/cases.
  await prisma.patient.updateMany({ where: { homeFacilityId: null }, data: { homeFacilityId: rhu.id } });
  await prisma.encounter.updateMany({ where: { facilityId: null }, data: { facilityId: rhu.id } });
  await prisma.case.updateMany({ where: { facilityId: null }, data: { facilityId: rhu.id } });

  const firstPatient = await prisma.patient.findFirst({ orderBy: { patientCode: 'asc' } });

  // Sample sharing consent + cross-facility referral (only if none exist).
  if (firstPatient) {
    const consentCount = await prisma.consent.count();
    if (consentCount === 0) {
      await prisma.consent.create({
        data: { patientId: firstPatient.id, purpose: 'TREATMENT', scope: 'SUMMARY', status: 'ACTIVE' },
      });
    }
    const referralCount = await prisma.referral.count();
    if (referralCount === 0) {
      await prisma.referral.create({
        data: {
          patientId: firstPatient.id,
          fromFacilityId: rhu.id,
          toFacilityId: hospital.id,
          reason: 'For further evaluation and platelet monitoring (dengue with warning signs).',
          clinicalSummary: 'Confirmed dengue. Stable vitals. Requires CBC monitoring and possible admission.',
          priority: 'URGENT',
          status: 'REQUESTED',
        },
      });
    }
  }

  console.log('Linked EHR facilities, consent, and referral.');
}

async function main() {
  console.log('Seeding HealthWatch database...');
  await seedBarangays();
  await seedDiseases();
  await seedFacilities();
  await seedTerminology();
  await seedUsers();
  await seedSampleData();
  await seedEmr();
  await seedEhrLinks();
  console.log('\nDefault login credentials:');
  console.log('  Admin:     admin@healthwatch.local / admin123');
  console.log('  MHO:       mho@healthwatch.local / mho123');
  console.log('  BHW:       bhw@healthwatch.local / bhw123');
  console.log('  Hospital:  hospital@healthwatch.local / hospital123');
  console.log('  Physician: physician@healthwatch.local / physician123');
  console.log('  Nurse:     nurse@healthwatch.local / nurse123');
  console.log('  Midwife:   midwife@healthwatch.local / midwife123');
  console.log('\nSeeding complete.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
