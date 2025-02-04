export const testData = {
  profiles: [
    {
      id: "54385478-b091-70d7-b6ab-ddc6b789b170",
      email: "board@noemail.com",
      name: "board",
      balance: 0,
      phone: "3218881515",
      address: "123 east|apt 1",
      billingFreq: "MONTHLY",
      city: "Springfield",
      cognitoID: "54385478-b091-70d7-b6ab-ddc6b789b170",
      contactPref: "CALL",
      state: "SC",
      type: "PROFILE",
      zip: "23456"
    },
    {
      id: "a4a84408-20f1-709f-0272-c9d2b96be859",
      email: "owner@noemail.com",
      name: "owner",
      balance: 0,
      phone: "4145551212",
      address: "234 jplot rd",
      billingFreq: "MONTHLY",
      city: "Springfield",
      cognitoID: "a4a84408-20f1-709f-0272-c9d2b96be859",
      contactPref: "CALL",
      state: "SC",
      type: "PROFILE",
      zip: "23456"
    },
    {
      id: "e46844c8-5061-70e2-11e8-768fab589bea",
      email: "resi@noemail.com",
      name: "resi",
      balance: 0,
      phone: "4145551212",
      address: "414 south road st",
      billingFreq: "MONTHLY",
      city: "ashville",
      cognitoID: "e46844c8-5061-70e2-11e8-768fab589bea",
      contactPref: "CALL",
      state: "SC",
      tenantAtId: "25",
      type: "PROFILE",
      zip: "98372"
    }
  ],
  properties: [
    {
      id: "28",
      ownerId: "a4a84408-20f1-709f-0272-c9d2b96be859",
      owner: "a4a84408-20f1-709f-0272-c9d2b96be859",
      address: "468 south road st",
      type: "PROPERTY"
    },
    {
      id: "25",
      ownerId: "a4a84408-20f1-709f-0272-c9d2b96be859",
      owner: "a4a84408-20f1-709f-0272-c9d2b96be859",
      tenantId: "e46844c8-5061-70e2-11e8-768fab589bea",
      address: "414 south road st",
      type: "PROPERTY"
    }
  ],  payments: [
    {
      ownerPaymentsId: "a4a84408-20f1-709f-0272-c9d2b96be859",
      id: "389af32b-8e11-4e89-98ef-b56efe48dddd",
      checkDate: "2024-11-15",
      invoiceNumber: "122",
      checkAmount: 200,
      checkNumber: "1001",
      invoiceAmount: 1.5,
      type: "PAYMENT"
    },
    {
      ownerPaymentsId: "a4a84408-20f1-709f-0272-c9d2b96be859",
      id: "89cfa96c-450a-4edd-b491-343eb4a83d08",
      checkDate: "2024-12-15",
      invoiceNumber: "122",
      checkAmount: 200,
      checkNumber: "1002",
      invoiceAmount: 1.5,
      type: "PAYMENT"
    },
    {
      ownerPaymentsId: "a4a84408-20f1-709f-0272-c9d2b96be859",
      id: "0eb2adf3-781f-4a62-9c9c-b6c3f0e056fb",
      checkDate: "2025-01-15",
      invoiceNumber: "134",
      checkAmount: 200,
      checkNumber: "1003",
      invoiceAmount: 1.5,
      type: "PAYMENT"
    }
  ]
};