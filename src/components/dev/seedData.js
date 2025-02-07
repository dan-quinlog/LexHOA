export const testData = {
  profiles: [
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
    }
  ],
  properties: [
    {
      id: "1234",
      address: "1234 Street St",
      profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
      profTenantId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
    },
    {
      id: "2345",
      address: "2345 Street St",
      profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
      profTenantId: "74b8d498-1071-70e1-dce4-d02b3a04e42b"
    },
    {
      id: "3456",
      address: "3456 Street St",
      profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c",
      profTenantId: "tenant-no-login"
    },
    {
      id: "7582",
      address: "7582 Street St",
      profOwnerId: "64c824e8-00b1-7080-e39e-f441cead3e4c"
    },
    {
      id: "4567",
      address: "4567 Street St"
    }
  ],
  bulletins: [
    {
      id: "welcome-bulletin",
      title: "Welcome",
      content: "Welcome to our HOA page!",
      audience: ["PUBLIC"],
      createdAt: "2025-02-01T12:00:00Z"
    }
  ]
};
