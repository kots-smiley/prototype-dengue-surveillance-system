import { Prisma } from '@prisma/client';
import { prisma } from '../../configuration/prisma';
import { AppError } from '../../helper/app-error';
import { VITAL_SIGN_LOINC } from '../../configuration/constants';

/**
 * HL7 FHIR R4 mapping. Internal records are projected to FHIR resources on
 * read (no duplicate storage). Used for interoperability / PHIE submission and
 * the International Patient Summary.
 */

const fhirInclude = {
  barangay: true,
  homeFacility: true,
  allergies: true,
  problems: true,
  immunizations: true,
  labResults: true,
  encounters: {
    orderBy: { encounterDate: 'desc' },
    include: {
      facility: true,
      clinician: { select: { id: true, firstName: true, lastName: true, role: true } },
      vitalSign: true,
      diagnoses: { include: { disease: true } },
      prescriptions: true,
    },
  },
} satisfies Prisma.PatientInclude;

type FhirPatient = Prisma.PatientGetPayload<{ include: typeof fhirInclude }>;

type Resource = Record<string, unknown>;

function toDateString(d: Date): string {
  return d.toISOString().split('T')[0];
}

function patientResource(p: FhirPatient): Resource {
  const identifier = [
    { system: 'urn:healthwatch:patientCode', value: p.patientCode },
    ...p.identifiers.map((i) => ({
      system: `urn:healthwatch:${i.system.toLowerCase()}`,
      value: i.value,
      use: i.use === 'OFFICIAL' ? 'official' : 'secondary',
    })),
    ...(p.philhealthNo
      ? [{ system: 'urn:healthwatch:philhealth', value: p.philhealthNo }]
      : []),
  ];
  return {
    resourceType: 'Patient',
    id: p.id,
    identifier,
    active: p.isActive,
    name: [
      {
        use: 'official',
        family: p.lastName,
        given: [p.firstName, ...(p.middleName ? [p.middleName] : [])],
      },
    ],
    gender: p.sex.toLowerCase(),
    birthDate: toDateString(p.birthDate),
    telecom: p.contactNumber ? [{ system: 'phone', value: p.contactNumber }] : [],
    address: p.address ? [{ text: p.address }] : [],
    managingOrganization: p.homeFacilityId ? { reference: `Organization/${p.homeFacilityId}` } : undefined,
  };
}

function organizationResource(facility: { id: string; name: string; type: string }): Resource {
  return {
    resourceType: 'Organization',
    id: facility.id,
    name: facility.name,
    type: [{ text: facility.type }],
  };
}

function conditionResource(dx: {
  id: string;
  description: string;
  icd10Code: string | null;
  snomedCode: string | null;
  certainty: string;
}, patientId: string): Resource {
  const coding = [];
  if (dx.icd10Code) coding.push({ system: 'http://hl7.org/fhir/sid/icd-10', code: dx.icd10Code, display: dx.description });
  if (dx.snomedCode) coding.push({ system: 'http://snomed.info/sct', code: dx.snomedCode, display: dx.description });
  return {
    resourceType: 'Condition',
    id: dx.id,
    subject: { reference: `Patient/${patientId}` },
    verificationStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: dx.certainty === 'CONFIRMED' ? 'confirmed' : 'provisional',
        },
      ],
    },
    code: { coding: coding.length ? coding : undefined, text: dx.description },
  };
}

function vitalObservations(vital: NonNullable<FhirPatient['encounters'][number]['vitalSign']>, patientId: string, date: Date): Resource[] {
  const out: Resource[] = [];
  for (const [key, meta] of Object.entries(VITAL_SIGN_LOINC)) {
    const value = (vital as unknown as Record<string, number | null>)[key];
    if (value == null) continue;
    out.push({
      resourceType: 'Observation',
      id: `${vital.id}-${key}`,
      status: 'final',
      category: [
        {
          coding: [
            { system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' },
          ],
        },
      ],
      code: { coding: [{ system: 'http://loinc.org', code: meta.code, display: meta.display }] },
      subject: { reference: `Patient/${patientId}` },
      effectiveDateTime: date.toISOString(),
      valueQuantity: { value, unit: meta.unit, system: 'http://unitsofmeasure.org' },
    });
  }
  return out;
}

function labObservation(lab: FhirPatient['labResults'][number], patientId: string): Resource {
  return {
    resourceType: 'Observation',
    id: lab.id,
    status: 'final',
    category: [
      { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'laboratory' }] },
    ],
    code: {
      coding: lab.loincCode ? [{ system: 'http://loinc.org', code: lab.loincCode, display: lab.testName }] : undefined,
      text: lab.testName,
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: lab.resultDate.toISOString(),
    valueString: lab.unit ? `${lab.value ?? ''} ${lab.unit}`.trim() : lab.value ?? undefined,
    referenceRange: lab.referenceRange ? [{ text: lab.referenceRange }] : undefined,
  };
}

function medicationRequests(prescription: FhirPatient['encounters'][number]['prescriptions'][number], patientId: string): Resource[] {
  return prescription.items.map((item, idx) => ({
    resourceType: 'MedicationRequest',
    id: `${prescription.id}-${idx}`,
    status: 'active',
    intent: 'order',
    subject: { reference: `Patient/${patientId}` },
    medicationCodeableConcept: { text: item.drug },
    dosageInstruction: [
      {
        text: [item.dose, item.frequency, item.duration].filter(Boolean).join(' · ') || undefined,
        patientInstruction: item.instructions ?? undefined,
      },
    ],
  }));
}

function immunizationResource(im: FhirPatient['immunizations'][number], patientId: string): Resource {
  return {
    resourceType: 'Immunization',
    id: im.id,
    status: 'completed',
    vaccineCode: { text: im.vaccine },
    patient: { reference: `Patient/${patientId}` },
    occurrenceDateTime: im.dateGiven.toISOString(),
  };
}

function allergyResource(a: FhirPatient['allergies'][number], patientId: string): Resource {
  return {
    resourceType: 'AllergyIntolerance',
    id: a.id,
    patient: { reference: `Patient/${patientId}` },
    code: { text: a.substance },
    reaction: a.reaction ? [{ manifestation: [{ text: a.reaction }] }] : undefined,
    criticality: a.severity === 'SEVERE' ? 'high' : a.severity === 'MODERATE' ? 'low' : undefined,
  };
}

function problemCondition(pr: FhirPatient['problems'][number], patientId: string): Resource {
  return {
    resourceType: 'Condition',
    id: pr.id,
    subject: { reference: `Patient/${patientId}` },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: pr.status === 'RESOLVED' ? 'resolved' : 'active',
        },
      ],
    },
    code: { text: pr.name },
  };
}

function encounterResource(e: FhirPatient['encounters'][number], patientId: string): Resource {
  return {
    resourceType: 'Encounter',
    id: e.id,
    status: 'finished',
    class: { code: e.type },
    subject: { reference: `Patient/${patientId}` },
    period: { start: e.encounterDate.toISOString() },
    serviceProvider: e.facilityId ? { reference: `Organization/${e.facilityId}` } : undefined,
  };
}

function buildEntries(p: FhirPatient): Resource[] {
  const entries: Resource[] = [patientResource(p)];
  if (p.homeFacility) entries.push(organizationResource(p.homeFacility));

  for (const a of p.allergies) entries.push(allergyResource(a, p.id));
  for (const pr of p.problems) entries.push(problemCondition(pr, p.id));
  for (const im of p.immunizations) entries.push(immunizationResource(im, p.id));
  for (const lab of p.labResults) entries.push(labObservation(lab, p.id));

  for (const e of p.encounters) {
    entries.push(encounterResource(e, p.id));
    if (e.facility) entries.push(organizationResource(e.facility));
    if (e.vitalSign) entries.push(...vitalObservations(e.vitalSign, p.id, e.encounterDate));
    for (const dx of e.diagnoses) entries.push(conditionResource(dx, p.id));
    for (const rx of e.prescriptions) entries.push(...medicationRequests(rx, p.id));
  }
  return entries;
}

function bundle(type: 'collection' | 'document', resources: Resource[]): Resource {
  return {
    resourceType: 'Bundle',
    type,
    timestamp: new Date().toISOString(),
    total: resources.length,
    entry: resources.map((r) => ({ resource: r })),
  };
}

async function loadPatient(id: string): Promise<FhirPatient> {
  const patient = await prisma.patient.findUnique({ where: { id }, include: fhirInclude });
  if (!patient) throw new AppError('Patient not found', 404);
  return patient;
}

export const fhirService = {
  async getPatient(id: string): Promise<Resource> {
    return patientResource(await loadPatient(id));
  },

  async getEverything(id: string): Promise<Resource> {
    const patient = await loadPatient(id);
    return bundle('collection', buildEntries(patient));
  },

  /** International Patient Summary (IPS) — a FHIR document Bundle. */
  async getSummary(id: string): Promise<Resource> {
    const patient = await loadPatient(id);
    const entries = buildEntries(patient);
    const composition: Resource = {
      resourceType: 'Composition',
      status: 'final',
      type: { coding: [{ system: 'http://loinc.org', code: '60591-5', display: 'Patient summary Document' }] },
      subject: { reference: `Patient/${patient.id}` },
      date: new Date().toISOString(),
      title: 'International Patient Summary',
      section: [
        { title: 'Active Problems', entry: patient.problems.map((p) => ({ reference: `Condition/${p.id}` })) },
        { title: 'Allergies', entry: patient.allergies.map((a) => ({ reference: `AllergyIntolerance/${a.id}` })) },
        { title: 'Immunizations', entry: patient.immunizations.map((i) => ({ reference: `Immunization/${i.id}` })) },
        { title: 'Results', entry: patient.labResults.map((l) => ({ reference: `Observation/${l.id}` })) },
      ],
    };
    return bundle('document', [composition, ...entries]);
  },

  /**
   * Minimal FHIR Bundle import: creates a Patient from an incoming Patient
   * resource (PHIE / external-system inbound). Demonstrates import conformance.
   */
  async importBundle(body: unknown, registeredById: string): Promise<{ created: number }> {
    const b = body as { resourceType?: string; entry?: { resource?: Record<string, unknown> }[] };
    if (b.resourceType !== 'Bundle' || !Array.isArray(b.entry)) {
      throw new AppError('Request body must be a FHIR Bundle', 400);
    }
    let created = 0;
    for (const e of b.entry) {
      const r = e.resource;
      if (!r || r.resourceType !== 'Patient') continue;
      const name = (r.name as { family?: string; given?: string[] }[] | undefined)?.[0];
      const total = await prisma.patient.count();
      await prisma.patient.create({
        data: {
          patientCode: `LOPEZ-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`,
          firstName: name?.given?.[0] ?? 'Unknown',
          lastName: name?.family ?? 'Unknown',
          birthDate: r.birthDate ? new Date(String(r.birthDate)) : new Date('1970-01-01'),
          sex: String(r.gender ?? 'MALE').toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE',
          registeredById,
          consentGiven: false,
        },
      });
      created++;
    }
    return { created };
  },
};
