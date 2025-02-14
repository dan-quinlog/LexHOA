
export const SEED_PROFILES = [
  {
    id: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    cognitoID: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    owner: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    name: "James Wilson",
    email: "jwilson@email.com",
    phone: "8435551234",
    address: "1234 Street St",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "EMAIL",
    billingFreq: "MONTHLY",
    allowText: false,
    balance: 0
  },
  {
    id: "74b8d498-1071-70e1-dce4-d02b3a04e42b",
    cognitoID: "74b8d498-1071-70e1-dce4-d02b3a04e42b",
    owner: "74b8d498-1071-70e1-dce4-d02b3a04e42b",
    name: "Sarah Martinez",
    email: "smartinez@email.com",
    phone: "8435556789",
    address: "2345 Street St",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "TEXT",
    billingFreq: "MONTHLY",
    allowText: true,
    balance: 0
  },
  {
    id: "54d83448-b0c1-70d6-5afa-09d0a5d2582a",
    cognitoID: "54d83448-b0c1-70d6-5afa-09d0a5d2582a",
    owner: "54d83448-b0c1-70d6-5afa-09d0a5d2582a",
    name: "Michael Chen",
    email: "mchen@email.com",
    phone: "8435552468",
    address: "9012 Maple Court",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "CALL",
    billingFreq: "MONTHLY",
    allowText: false,
    balance: 0
  },
  {
    id: "tenant-no-login",
    owner: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    name: "Robert Taylor",
    email: "rtaylor@email.com",
    phone: "8435553579",
    address: "3456 Street St",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "EMAIL",
    allowText: false
  },
  {
    id: "owner-no-login",
    owner: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    name: "David Johnson",
    email: "djohnson@email.com",
    phone: "8435557890",
    address: "5678 Street St",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "EMAIL",
    allowText: false
  },
  {
    id: "14e8b428-f041-70d4-81ad-f3a9bc46f4a5",
    cognitoID: "14e8b428-f041-70d4-81ad-f3a9bc46f4a5",
    owner: "14e8b428-f041-70d4-81ad-f3a9bc46f4a5",
    name: "David Johnson",
    email: "djohnson@email.com",
    phone: "8435557890",
    address: "5678 Street St",
    city: "West Columbia",
    state: "SC",
    zip: "29169",
    contactPref: "EMAIL",
    billingFreq: "MONTHLY",
    allowText: false,
    balance: 0
  }
];

export const SEED_PROPERTIES = [
  {
    id: "1234",
    address: "1234 Street St",
    type: "PROPERTY"
  },
  {
    id: "2345",
    address: "2345 Street St",
    type: "PROPERTY"
  },
  {
    id: "3456",
    address: "3456 Street St",
    type: "PROPERTY"
  },
  {
    id: "7582",
    address: "7582 Street St",
    type: "PROPERTY"
  },
  {
    id: "4567",
    address: "4567 Street St",
    type: "PROPERTY"
  },
  {
    id: "5678",
    address: "5678 Street St",
    type: "PROPERTY"
  }
];

export const SEED_PAYMENTS = [
  // James Wilson's payments ($1500 quarterly for 4 properties)
  {
    id: "pay-wilson-q1",
    checkDate: "2024-01-15",
    checkNumber: "1001",
    checkAmount: 1500.00,
    invoiceNumber: "INV-WILSON-Q1",
    invoiceAmount: 1500.00,
    ownerPaymentsId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  {
    id: "pay-wilson-q2",
    checkDate: "2024-04-15",
    checkNumber: "1002",
    checkAmount: 1500.00,
    invoiceNumber: "INV-WILSON-Q2",
    invoiceAmount: 1500.00,
    ownerPaymentsId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  {
    id: "pay-wilson-q3",
    checkDate: "2024-07-15",
    checkNumber: "1003",
    checkAmount: 1500.00,
    invoiceNumber: "INV-WILSON-Q3",
    invoiceAmount: 1500.00,
    ownerPaymentsId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  {
    id: "pay-wilson-q4",
    checkDate: "2024-10-15",
    checkNumber: "1004",
    checkAmount: 1500.00,
    invoiceNumber: "INV-WILSON-Q4",
    invoiceAmount: 1500.00,
    ownerPaymentsId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  // Owner-no-login payments ($375 quarterly for 1 property)
  {
    id: "pay-owner-q1",
    checkDate: "2024-01-15",
    checkNumber: "2001",
    checkAmount: 375.00,
    invoiceNumber: "INV-OWNER-Q1",
    invoiceAmount: 375.00,
    ownerPaymentsId: "owner-no-login"
  },
  {
    id: "pay-owner-q2",
    checkDate: "2024-04-15",
    checkNumber: "2002",
    checkAmount: 375.00,
    invoiceNumber: "INV-OWNER-Q2",
    invoiceAmount: 375.00,
    ownerPaymentsId: "owner-no-login"
  },
  {
    id: "pay-owner-q3",
    checkDate: "2024-07-15",
    checkNumber: "2003",
    checkAmount: 375.00,
    invoiceNumber: "INV-OWNER-Q3",
    invoiceAmount: 375.00,
    ownerPaymentsId: "owner-no-login"
  },
  {
    id: "pay-owner-q4",
    checkDate: "2024-10-15",
    checkNumber: "2004",
    checkAmount: 375.00,
    invoiceNumber: "INV-OWNER-Q4",
    invoiceAmount: 375.00,
    ownerPaymentsId: "owner-no-login"
  }
];

export const SEED_RELATIONSHIPS = [
  {
    propertyId: "1234",
    profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    profTenantId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  {
    propertyId: "2345",
    profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    profTenantId: "74b8d498-1071-70e1-dce4-d02b3a04e42b"
  },
  {
    propertyId: "3456",
    profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
    profTenantId: "tenant-no-login"
  },
  {
    propertyId: "7582",
    profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
  },
  {
    propertyId: "5678",
    profOwnerId: "owner-no-login"
  }
];

export const SEED_BULLETINS = [
  {
    id: "welcome-bulletin",
    title: "Welcome",
    content: "Welcome to our HOA page!",
    audience: ["PUBLIC"],
    createdAt: "2025-02-01T12:00:00Z"
  }
];